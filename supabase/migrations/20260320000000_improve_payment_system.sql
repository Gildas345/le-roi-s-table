-- Add payment tracking fields to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('fedapay', 'mtn_money', 'moov_money', 'cash', 'card')),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON public.orders(transaction_id);

-- Update RLS policies to allow order tracking
CREATE POLICY "Users can track their orders" ON public.orders 
FOR SELECT 
USING (true);

-- Function to get order details with items
CREATE OR REPLACE FUNCTION public.get_order_details(order_uuid UUID)
RETURNS TABLE (
  order_id UUID,
  customer_name TEXT,
  phone TEXT,
  address TEXT,
  delivery_mode TEXT,
  total_price INTEGER,
  status TEXT,
  payment_status TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ,
  item_name TEXT,
  item_quantity INTEGER,
  item_price INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.customer_name,
    o.phone,
    o.address,
    o.delivery_mode,
    o.total_price,
    o.status,
    o.payment_status,
    o.payment_method,
    o.transaction_id,
    o.created_at,
    m.name,
    oi.quantity,
    oi.price
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  LEFT JOIN menu_items m ON oi.menu_item_id = m.id
  WHERE o.id = order_uuid;
$$;

-- Add statistics functions
CREATE OR REPLACE FUNCTION public.get_sales_stats(days_count INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total_orders BIGINT,
  total_revenue BIGINT,
  paid_orders BIGINT,
  pending_orders BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_orders,
    SUM(total_price) as total_revenue,
    COUNT(*) FILTER (WHERE payment_status = 'paye') as paid_orders,
    COUNT(*) FILTER (WHERE payment_status = 'en_attente') as pending_orders
  FROM orders
  WHERE created_at >= NOW() - (days_count || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_top_products(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  product_name TEXT,
  total_quantity BIGINT,
  total_revenue BIGINT,
  order_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.name as product_name,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.quantity * oi.price) as total_revenue,
    COUNT(DISTINCT oi.order_id) as order_count
  FROM order_items oi
  JOIN menu_items m ON oi.menu_item_id = m.id
  JOIN orders o ON oi.order_id = o.id
  WHERE o.payment_status = 'paye'
  GROUP BY m.id, m.name
  ORDER BY total_quantity DESC
  LIMIT limit_count;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_order_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_products TO authenticated;
