insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'previx-documents',
  'previx-documents',
  false,
  20971520,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists previx_documents_read on storage.objects;
create policy previx_documents_read
  on storage.objects for select to authenticated
  using (
    bucket_id = 'previx-documents'
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and (
          p.tipo = 'adm'
          or (
            p.tipo = 'empresa'
            and p.empresa_id::text = (storage.foldername(name))[1]
          )
        )
    )
  );

drop policy if exists previx_documents_upload on storage.objects;
create policy previx_documents_upload
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'previx-documents'
    and array_length(storage.foldername(name), 1) = 1
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and (
          p.tipo = 'adm'
          or (
            p.tipo = 'empresa'
            and p.empresa_id::text = (storage.foldername(name))[1]
          )
        )
    )
  );

drop policy if exists previx_documents_delete on storage.objects;
create policy previx_documents_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'previx-documents'
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and (
          p.tipo = 'adm'
          or (
            p.tipo = 'empresa'
            and p.empresa_id::text = (storage.foldername(name))[1]
          )
        )
    )
  );
