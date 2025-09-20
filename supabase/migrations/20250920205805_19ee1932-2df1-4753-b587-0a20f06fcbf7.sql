-- Fix orders.user_id foreign key to allow anonymous/public orders
-- 1) Ensure profiles.user_id is unique so it can be referenced
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique_idx
ON public.profiles(user_id);

-- 2) Drop existing FK (likely pointing to a non-existent or wrong table)
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- 3) Add correct FK to profiles.user_id
ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(user_id)
ON DELETE RESTRICT;

-- 4) Seed a public profile used by the app's PUBLIC_USER_ID
INSERT INTO public.profiles (user_id, display_name)
VALUES ('00000000-0000-0000-0000-000000000000', 'Public User')
ON CONFLICT (user_id) DO NOTHING;
