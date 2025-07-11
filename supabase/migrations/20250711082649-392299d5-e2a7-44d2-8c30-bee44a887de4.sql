-- Test inserting a single row to understand the constraint
INSERT INTO public.stock_levels (product_id, location, quantity) VALUES 
('11111111-1111-1111-1111-111111111001', 'bar', 1);