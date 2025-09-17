-- Fix the security warning by setting search_path for the function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;