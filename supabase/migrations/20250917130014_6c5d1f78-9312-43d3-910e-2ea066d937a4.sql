-- Add discontinued functionality to products table
ALTER TABLE public.products 
ADD COLUMN discontinued BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN discontinued_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN discontinued_by UUID;

-- Add index for better performance when filtering discontinued products
CREATE INDEX idx_products_discontinued ON public.products(discontinued);

-- Add index for discontinued_at for temporal queries
CREATE INDEX idx_products_discontinued_at ON public.products(discontinued_at);

-- Create trigger to automatically set discontinued_at when discontinued is set to true
CREATE OR REPLACE FUNCTION public.set_discontinued_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- When discontinued is set to true, set the timestamp and user
  IF NEW.discontinued = true AND OLD.discontinued = false THEN
    NEW.discontinued_at = now();
    NEW.discontinued_by = auth.uid();
  -- When discontinued is set back to false, clear the timestamp and user
  ELSIF NEW.discontinued = false AND OLD.discontinued = true THEN
    NEW.discontinued_at = NULL;
    NEW.discontinued_by = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for products table
CREATE TRIGGER set_products_discontinued_timestamp
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_discontinued_timestamp();