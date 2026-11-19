
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT lower(COALESCE(auth.jwt() ->> 'email', '')) = 'hussainad920@gmail.com';
$$;
