-- WCA News: the school's emailed newsletter (made in Smore), kept in the app as an archive.
-- Everyone reads it (signed out too). push.send holders add an issue by pasting its Smore link
-- (the import-newsletter Edge Function reads the page and calls newsletter_save) or remove one.
-- `blocks` is the issue's content: headings, text items and pictures
-- (supabase/functions/import-newsletter/smore.ts).

create table public.newsletters (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (length(trim(title)) between 1 and 120),
  sent_on     date not null,
  source_url  text not null unique check (source_url ~ '^https://app\.smore\.com/n/'),
  blocks      jsonb not null check (jsonb_typeof(blocks) = 'array'),
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index on public.newsletters (sent_on desc);

alter table public.newsletters enable row level security;
create policy "everyone reads WCA News" on public.newsletters for select to anon, authenticated using (true);

/** push.send: add an issue, or refresh one already added from the same link. Returns its id. */
create function public.newsletter_save(p_source_url text, p_title text, p_sent_on date, p_blocks jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  perform app.require_permission('push.send');
  if p_source_url is null or p_source_url !~ '^https://app\.smore\.com/n/' then raise exception 'Use the issue''s Smore link.'; end if;
  if p_sent_on is null then raise exception 'The issue needs its date.'; end if;
  if p_blocks is null or jsonb_typeof(p_blocks) <> 'array' or jsonb_array_length(p_blocks) = 0 then
    raise exception 'That issue has nothing in it.';
  end if;
  if length(p_blocks::text) > 300000 then raise exception 'That issue is too long to add.'; end if;
  insert into newsletters (title, sent_on, source_url, blocks, created_by)
  values (coalesce(nullif(trim(p_title), ''), 'WCA News'), p_sent_on, p_source_url, p_blocks, auth.uid())
  on conflict (source_url) do update set title = excluded.title, sent_on = excluded.sent_on, blocks = excluded.blocks
  returning id into new_id;
  perform app.audit(null, 'newsletter.saved', new_id::text, jsonb_build_object('sentOn', p_sent_on, 'url', p_source_url));
  return new_id;
end $$;

/** push.send: remove an issue. */
create function public.newsletter_delete(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare gone date;
begin
  perform app.require_permission('push.send');
  delete from newsletters where id = p_id returning sent_on into gone;
  if gone is not null then perform app.audit(null, 'newsletter.deleted', p_id::text, jsonb_build_object('sentOn', gone)); end if;
end $$;

revoke all on function public.newsletter_save(text, text, date, jsonb), public.newsletter_delete(uuid) from public, anon;
grant execute on function public.newsletter_save(text, text, date, jsonb), public.newsletter_delete(uuid) to authenticated, service_role;

-- Reads go through row-level security; writes only through the functions above.
revoke insert, update, delete on public.newsletters from anon, authenticated;
grant select on public.newsletters to anon, authenticated;
grant all on public.newsletters to service_role;
