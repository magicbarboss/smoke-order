-- Remove FK on orders.user_id to allow anonymous/public orders without auth
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;