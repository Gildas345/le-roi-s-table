
-- Allow anyone to read orders (needed to show receipt after payment)
CREATE POLICY "Anyone can read orders by id"
ON public.orders
FOR SELECT
TO anon
USING (true);

-- Allow anyone to read order items (for receipt)
CREATE POLICY "Anyone can read order items"
ON public.order_items
FOR SELECT
TO anon
USING (true);
