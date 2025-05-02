create type "public"."type_equipment" as enum ('Perforador', 'Perforador Spudder', 'Work over', 'Fractura', 'Coiled Tubing');

create table "public"."area_province" (
    "id" uuid not null default gen_random_uuid(),
    "area_id" uuid not null,
    "province_id" bigint not null
);


alter table "public"."area_province" enable row level security;

create table "public"."areas_cliente" (
    "id" uuid not null default gen_random_uuid(),
    "nombre" text not null,
    "descripcion_corta" text,
    "customer_id" uuid not null
);


create table "public"."equipos_clientes" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "type" type_equipment not null,
    "customer_id" uuid not null
);


alter table "public"."equipos_clientes" enable row level security;

create table "public"."sector_customer" (
    "id" uuid not null default gen_random_uuid(),
    "sector_id" uuid not null,
    "customer_id" uuid not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
);


alter table "public"."sector_customer" enable row level security;

create table "public"."sectors" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "descripcion_corta" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
);


alter table "public"."sectors" enable row level security;

alter table "public"."diagram_type" alter column "is_active" set not null;

CREATE UNIQUE INDEX area_province_id_key ON public.area_province USING btree (id);

CREATE UNIQUE INDEX area_province_pkey ON public.area_province USING btree (id);

CREATE UNIQUE INDEX areas_cliente_pkey ON public.areas_cliente USING btree (id);

CREATE UNIQUE INDEX equipos_clientes_pkey ON public.equipos_clientes USING btree (id);

CREATE UNIQUE INDEX sector_customer_pkey ON public.sector_customer USING btree (id);

CREATE UNIQUE INDEX sector_customer_sector_id_customer_id_key ON public.sector_customer USING btree (sector_id, customer_id);

CREATE UNIQUE INDEX sectors_pkey ON public.sectors USING btree (id);

alter table "public"."area_province" add constraint "area_province_pkey" PRIMARY KEY using index "area_province_pkey";

alter table "public"."areas_cliente" add constraint "areas_cliente_pkey" PRIMARY KEY using index "areas_cliente_pkey";

alter table "public"."equipos_clientes" add constraint "equipos_clientes_pkey" PRIMARY KEY using index "equipos_clientes_pkey";

alter table "public"."sector_customer" add constraint "sector_customer_pkey" PRIMARY KEY using index "sector_customer_pkey";

alter table "public"."sectors" add constraint "sectors_pkey" PRIMARY KEY using index "sectors_pkey";

alter table "public"."area_province" add constraint "area_province_area_id_fkey" FOREIGN KEY (area_id) REFERENCES areas_cliente(id) not valid;

alter table "public"."area_province" validate constraint "area_province_area_id_fkey";

alter table "public"."area_province" add constraint "area_province_id_key" UNIQUE using index "area_province_id_key";

alter table "public"."area_province" add constraint "area_province_province_id_fkey" FOREIGN KEY (province_id) REFERENCES provinces(id) not valid;

alter table "public"."area_province" validate constraint "area_province_province_id_fkey";

alter table "public"."areas_cliente" add constraint "areas_cliente_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) not valid;

alter table "public"."areas_cliente" validate constraint "areas_cliente_customer_id_fkey";

alter table "public"."equipos_clientes" add constraint "equipos_clientes_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) not valid;

alter table "public"."equipos_clientes" validate constraint "equipos_clientes_customer_id_fkey";

alter table "public"."sector_customer" add constraint "sector_customer_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE not valid;

alter table "public"."sector_customer" validate constraint "sector_customer_customer_id_fkey";

alter table "public"."sector_customer" add constraint "sector_customer_sector_id_customer_id_key" UNIQUE using index "sector_customer_sector_id_customer_id_key";

alter table "public"."sector_customer" add constraint "sector_customer_sector_id_fkey" FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE not valid;

alter table "public"."sector_customer" validate constraint "sector_customer_sector_id_fkey";

grant delete on table "public"."area_province" to "anon";

grant insert on table "public"."area_province" to "anon";

grant references on table "public"."area_province" to "anon";

grant select on table "public"."area_province" to "anon";

grant trigger on table "public"."area_province" to "anon";

grant truncate on table "public"."area_province" to "anon";

grant update on table "public"."area_province" to "anon";

grant delete on table "public"."area_province" to "authenticated";

grant insert on table "public"."area_province" to "authenticated";

grant references on table "public"."area_province" to "authenticated";

grant select on table "public"."area_province" to "authenticated";

grant trigger on table "public"."area_province" to "authenticated";

grant truncate on table "public"."area_province" to "authenticated";

grant update on table "public"."area_province" to "authenticated";

grant delete on table "public"."area_province" to "service_role";

grant insert on table "public"."area_province" to "service_role";

grant references on table "public"."area_province" to "service_role";

grant select on table "public"."area_province" to "service_role";

grant trigger on table "public"."area_province" to "service_role";

grant truncate on table "public"."area_province" to "service_role";

grant update on table "public"."area_province" to "service_role";

grant delete on table "public"."areas_cliente" to "anon";

grant insert on table "public"."areas_cliente" to "anon";

grant references on table "public"."areas_cliente" to "anon";

grant select on table "public"."areas_cliente" to "anon";

grant trigger on table "public"."areas_cliente" to "anon";

grant truncate on table "public"."areas_cliente" to "anon";

grant update on table "public"."areas_cliente" to "anon";

grant delete on table "public"."areas_cliente" to "authenticated";

grant insert on table "public"."areas_cliente" to "authenticated";

grant references on table "public"."areas_cliente" to "authenticated";

grant select on table "public"."areas_cliente" to "authenticated";

grant trigger on table "public"."areas_cliente" to "authenticated";

grant truncate on table "public"."areas_cliente" to "authenticated";

grant update on table "public"."areas_cliente" to "authenticated";

grant delete on table "public"."areas_cliente" to "service_role";

grant insert on table "public"."areas_cliente" to "service_role";

grant references on table "public"."areas_cliente" to "service_role";

grant select on table "public"."areas_cliente" to "service_role";

grant trigger on table "public"."areas_cliente" to "service_role";

grant truncate on table "public"."areas_cliente" to "service_role";

grant update on table "public"."areas_cliente" to "service_role";

grant delete on table "public"."equipos_clientes" to "anon";

grant insert on table "public"."equipos_clientes" to "anon";

grant references on table "public"."equipos_clientes" to "anon";

grant select on table "public"."equipos_clientes" to "anon";

grant trigger on table "public"."equipos_clientes" to "anon";

grant truncate on table "public"."equipos_clientes" to "anon";

grant update on table "public"."equipos_clientes" to "anon";

grant delete on table "public"."equipos_clientes" to "authenticated";

grant insert on table "public"."equipos_clientes" to "authenticated";

grant references on table "public"."equipos_clientes" to "authenticated";

grant select on table "public"."equipos_clientes" to "authenticated";

grant trigger on table "public"."equipos_clientes" to "authenticated";

grant truncate on table "public"."equipos_clientes" to "authenticated";

grant update on table "public"."equipos_clientes" to "authenticated";

grant delete on table "public"."equipos_clientes" to "service_role";

grant insert on table "public"."equipos_clientes" to "service_role";

grant references on table "public"."equipos_clientes" to "service_role";

grant select on table "public"."equipos_clientes" to "service_role";

grant trigger on table "public"."equipos_clientes" to "service_role";

grant truncate on table "public"."equipos_clientes" to "service_role";

grant update on table "public"."equipos_clientes" to "service_role";

grant delete on table "public"."sector_customer" to "anon";

grant insert on table "public"."sector_customer" to "anon";

grant references on table "public"."sector_customer" to "anon";

grant select on table "public"."sector_customer" to "anon";

grant trigger on table "public"."sector_customer" to "anon";

grant truncate on table "public"."sector_customer" to "anon";

grant update on table "public"."sector_customer" to "anon";

grant delete on table "public"."sector_customer" to "authenticated";

grant insert on table "public"."sector_customer" to "authenticated";

grant references on table "public"."sector_customer" to "authenticated";

grant select on table "public"."sector_customer" to "authenticated";

grant trigger on table "public"."sector_customer" to "authenticated";

grant truncate on table "public"."sector_customer" to "authenticated";

grant update on table "public"."sector_customer" to "authenticated";

grant delete on table "public"."sector_customer" to "service_role";

grant insert on table "public"."sector_customer" to "service_role";

grant references on table "public"."sector_customer" to "service_role";

grant select on table "public"."sector_customer" to "service_role";

grant trigger on table "public"."sector_customer" to "service_role";

grant truncate on table "public"."sector_customer" to "service_role";

grant update on table "public"."sector_customer" to "service_role";

grant delete on table "public"."sectors" to "anon";

grant insert on table "public"."sectors" to "anon";

grant references on table "public"."sectors" to "anon";

grant select on table "public"."sectors" to "anon";

grant trigger on table "public"."sectors" to "anon";

grant truncate on table "public"."sectors" to "anon";

grant update on table "public"."sectors" to "anon";

grant delete on table "public"."sectors" to "authenticated";

grant insert on table "public"."sectors" to "authenticated";

grant references on table "public"."sectors" to "authenticated";

grant select on table "public"."sectors" to "authenticated";

grant trigger on table "public"."sectors" to "authenticated";

grant truncate on table "public"."sectors" to "authenticated";

grant update on table "public"."sectors" to "authenticated";

grant delete on table "public"."sectors" to "service_role";

grant insert on table "public"."sectors" to "service_role";

grant references on table "public"."sectors" to "service_role";

grant select on table "public"."sectors" to "service_role";

grant trigger on table "public"."sectors" to "service_role";

grant truncate on table "public"."sectors" to "service_role";

grant update on table "public"."sectors" to "service_role";

create policy "Permitir todo"
on "public"."area_province"
as permissive
for all
to public
using (true)
with check (true);


create policy "Permitir todo"
on "public"."areas_cliente"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Permitir todo"
on "public"."equipos_clientes"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Permitir todo"
on "public"."sector_customer"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Permitir todo"
on "public"."sectors"
as permissive
for all
to authenticated
using (true)
with check (true);



