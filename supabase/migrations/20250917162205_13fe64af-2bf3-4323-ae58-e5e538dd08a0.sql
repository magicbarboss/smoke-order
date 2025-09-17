-- Allow anonymous access to all inventory management tables
-- This removes authentication requirements from the app

-- Update products table policies to allow anonymous access
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;

CREATE POLICY "Anonymous users can manage products" ON public.products
FOR ALL USING (true) WITH CHECK (true);

-- Update stock_levels table policies to allow anonymous access
DROP POLICY IF EXISTS "Authenticated users can manage stock levels" ON public.stock_levels;
DROP POLICY IF EXISTS "Authenticated users can view stock levels" ON public.stock_levels;

CREATE POLICY "Anonymous users can manage stock levels" ON public.stock_levels
FOR ALL USING (true) WITH CHECK (true);

-- Update orders table policies to allow anonymous access
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Set a default user_id for orders to handle the not-null constraint
ALTER TABLE public.orders ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

CREATE POLICY "Anonymous users can manage orders" ON public.orders
FOR ALL USING (true) WITH CHECK (true);

-- Update order_items table policies to allow anonymous access  
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can update their order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;

CREATE POLICY "Anonymous users can manage order items" ON public.order_items
FOR ALL USING (true) WITH CHECK (true);

-- Update price_history table policies to allow anonymous access
DROP POLICY IF EXISTS "Authenticated users can create price history" ON public.price_history;
DROP POLICY IF EXISTS "Authenticated users can view price history" ON public.price_history;

-- Set a default changed_by for price history
ALTER TABLE public.price_history ALTER COLUMN changed_by SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

CREATE POLICY "Anonymous users can manage price history" ON public.price_history
FOR ALL USING (true) WITH CHECK (true);