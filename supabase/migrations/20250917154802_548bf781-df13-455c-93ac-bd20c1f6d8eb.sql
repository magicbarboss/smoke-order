-- Create a function to reset password for the specific user
CREATE OR REPLACE FUNCTION reset_user_password()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the password for magicbarboss@gmail.com to 'smoke101'
  -- Using the auth admin functions
  PERFORM auth.admin_update_user_by_id(
    '93cd812a-79d9-4a83-a6a7-854d2b30de29'::uuid,
    json_build_object('password', 'smoke101')::jsonb
  );
END;
$$;

-- Execute the function to reset the password
SELECT reset_user_password();

-- Drop the function as it's no longer needed
DROP FUNCTION reset_user_password();