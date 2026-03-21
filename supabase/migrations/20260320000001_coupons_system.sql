-- Coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  min_order_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER, -- For percentage discounts
  usage_limit INTEGER, -- NULL = unlimited
  usage_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons to validate
CREATE POLICY "Anyone can read active coupons" ON public.coupons 
FOR SELECT 
USING (active = true AND (valid_until IS NULL OR valid_until > now()));

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" ON public.coupons 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Coupon usage tracking table
CREATE TABLE public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  discount_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, order_id)
);

ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Admins can read coupon usage
CREATE POLICY "Admins can read coupon usage" ON public.coupon_usage 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Add coupon fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  coupon_code_input TEXT,
  order_amount INTEGER
)
RETURNS TABLE (
  valid BOOLEAN,
  discount_amount INTEGER,
  message TEXT,
  coupon_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_discount INTEGER;
BEGIN
  -- Find coupon
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = UPPER(coupon_code_input)
  AND active = true
  AND (valid_until IS NULL OR valid_until > now())
  AND valid_from <= now();

  -- Coupon not found or invalid
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Code promo invalide ou expiré'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check minimum order amount
  IF v_coupon.min_order_amount > 0 AND order_amount < v_coupon.min_order_amount THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      'Montant minimum de commande: ' || v_coupon.min_order_amount::TEXT || ' FCFA',
      NULL::UUID;
    RETURN;
  END IF;

  -- Check usage limit
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT false, 0, 'Ce code promo a atteint sa limite d''utilisation'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := FLOOR(order_amount * v_coupon.discount_value / 100.0);
    
    -- Apply max discount cap if set
    IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
      v_discount := v_coupon.max_discount_amount;
    END IF;
  ELSE
    -- Fixed discount
    v_discount := v_coupon.discount_value;
    
    -- Discount can't exceed order amount
    IF v_discount > order_amount THEN
      v_discount := order_amount;
    END IF;
  END IF;

  -- Return success
  RETURN QUERY SELECT 
    true, 
    v_discount,
    'Code promo appliqué: -' || v_discount::TEXT || ' FCFA'::TEXT,
    v_coupon.id;
END;
$$;

-- Function to apply coupon (increment usage count)
CREATE OR REPLACE FUNCTION public.apply_coupon(
  coupon_code_input TEXT,
  order_id_input UUID,
  discount_amount_input INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon_id UUID;
BEGIN
  -- Get coupon ID
  SELECT id INTO v_coupon_id
  FROM coupons
  WHERE code = UPPER(coupon_code_input);

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Increment usage count
  UPDATE coupons
  SET usage_count = usage_count + 1
  WHERE id = v_coupon_id;

  -- Record usage
  INSERT INTO coupon_usage (coupon_id, order_id, discount_amount)
  VALUES (v_coupon_id, order_id_input, discount_amount_input);

  RETURN true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_coupon TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_coupon TO anon, authenticated;

-- Create some sample coupons (optional)
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit)
VALUES 
  ('BIENVENUE10', 'Réduction de 10% pour nouveaux clients', 'percentage', 10, 3000, 2000, NULL),
  ('FIDELE500', '500 FCFA de réduction', 'fixed', 500, 2000, NULL, NULL),
  ('VIP20', '20% de réduction VIP', 'percentage', 20, 5000, 5000, 100);
