-- Change stock_levels.quantity column from integer to numeric to support decimal values
ALTER TABLE public.stock_levels 
ALTER COLUMN quantity TYPE numeric USING quantity::numeric;