-- Add product_code column to products table for reliable matching
ALTER TABLE public.products 
ADD COLUMN product_code text;

-- Create unique constraint on product_code per supplier
ALTER TABLE public.products 
ADD CONSTRAINT products_supplier_code_unique 
UNIQUE (supplier_id, product_code);

-- Create index for better performance on code lookups
CREATE INDEX idx_products_supplier_code ON public.products(supplier_id, product_code);