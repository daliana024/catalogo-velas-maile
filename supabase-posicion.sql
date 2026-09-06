-- EJECUTA ESTO UNA SOLA VEZ EN SUPABASE > SQL EDITOR

alter table public.productos
add column if not exists posicion_x int4 default 50;

alter table public.productos
add column if not exists posicion_y int4 default 50;

update public.productos set posicion_x = 50 where posicion_x is null;
update public.productos set posicion_y = 50 where posicion_y is null;
