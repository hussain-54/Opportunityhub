-- Allow admins to remove newsletter subscribers from the dashboard.
create policy "Admins delete subscribers"
  on public.newsletter_subscribers for delete
  using (public.is_admin());
