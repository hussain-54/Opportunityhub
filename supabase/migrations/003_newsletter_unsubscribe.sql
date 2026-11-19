-- Allow subscribers to remove themselves via a security-definer RPC.
create or replace function public.unsubscribe_newsletter(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := lower(trim(p_email));
begin
  if normalized is null or normalized = '' or position('@' in normalized) = 0 then
    return false;
  end if;

  delete from public.newsletter_subscribers
  where lower(email) = normalized;

  return found;
end;
$$;

revoke all on function public.unsubscribe_newsletter(text) from public;
grant execute on function public.unsubscribe_newsletter(text) to anon, authenticated;
