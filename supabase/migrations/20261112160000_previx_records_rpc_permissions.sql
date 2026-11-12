revoke all on function public.previx_list_records(uuid, text) from public, anon;
revoke all on function public.previx_create_record(uuid, text, jsonb) from public, anon;
revoke all on function public.previx_update_record(uuid, uuid, jsonb) from public, anon;
revoke all on function public.previx_delete_record(uuid, uuid) from public, anon;
revoke all on function public.previx_verify_employee_pin(uuid, uuid, text) from public, anon;
revoke all on function public.previx_create_epi_delivery(uuid, uuid, text, jsonb, text, boolean, text) from public, anon;

grant execute on function public.previx_list_records(uuid, text) to authenticated;
grant execute on function public.previx_create_record(uuid, text, jsonb) to authenticated;
grant execute on function public.previx_update_record(uuid, uuid, jsonb) to authenticated;
grant execute on function public.previx_delete_record(uuid, uuid) to authenticated;
grant execute on function public.previx_verify_employee_pin(uuid, uuid, text) to authenticated;
grant execute on function public.previx_create_epi_delivery(uuid, uuid, text, jsonb, text, boolean, text) to authenticated;
