create table "public"."documents_contracts" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "type" text not null,
    "date" timestamp with time zone default now(),
    "size" text not null,
    "path" text not null,
    "contract_id" text not null,
    "description" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."documents_contracts" enable row level security;

alter table "public"."customer_services" add column "area_id" uuid;

alter table "public"."customer_services" add column "contract_number" text;

alter table "public"."customer_services" add column "sector_id" uuid;

alter table "public"."service_items" add column "code_item" text;

alter table "public"."service_items" add column "item_number" text;

CREATE UNIQUE INDEX documents_pkey1 ON public.documents_contracts USING btree (id);

CREATE INDEX idx_documents_contract_id ON public.documents_contracts USING btree (contract_id);

CREATE INDEX idx_documents_name ON public.documents_contracts USING btree (name);

CREATE INDEX idx_documents_type ON public.documents_contracts USING btree (type);

alter table "public"."documents_contracts" add constraint "documents_pkey1" PRIMARY KEY using index "documents_pkey1";

alter table "public"."customer_services" add constraint "customer_services_area_id_fkey" FOREIGN KEY (area_id) REFERENCES areas_cliente(id) not valid;

alter table "public"."customer_services" validate constraint "customer_services_area_id_fkey";

alter table "public"."customer_services" add constraint "customer_services_sector_id_fkey" FOREIGN KEY (sector_id) REFERENCES sectors(id) not valid;

alter table "public"."customer_services" validate constraint "customer_services_sector_id_fkey";

grant delete on table "public"."documents_contracts" to "anon";

grant insert on table "public"."documents_contracts" to "anon";

grant references on table "public"."documents_contracts" to "anon";

grant select on table "public"."documents_contracts" to "anon";

grant trigger on table "public"."documents_contracts" to "anon";

grant truncate on table "public"."documents_contracts" to "anon";

grant update on table "public"."documents_contracts" to "anon";

grant delete on table "public"."documents_contracts" to "authenticated";

grant insert on table "public"."documents_contracts" to "authenticated";

grant references on table "public"."documents_contracts" to "authenticated";

grant select on table "public"."documents_contracts" to "authenticated";

grant trigger on table "public"."documents_contracts" to "authenticated";

grant truncate on table "public"."documents_contracts" to "authenticated";

grant update on table "public"."documents_contracts" to "authenticated";

grant delete on table "public"."documents_contracts" to "service_role";

grant insert on table "public"."documents_contracts" to "service_role";

grant references on table "public"."documents_contracts" to "service_role";

grant select on table "public"."documents_contracts" to "service_role";

grant trigger on table "public"."documents_contracts" to "service_role";

grant truncate on table "public"."documents_contracts" to "service_role";

grant update on table "public"."documents_contracts" to "service_role";

create policy "Usuarios autenticados pueden eliminar documentos"
on "public"."documents_contracts"
as permissive
for delete
to authenticated
using (true);


create policy "Usuarios autenticados pueden insertar documentos"
on "public"."documents_contracts"
as permissive
for insert
to authenticated
with check (true);


create policy "Usuarios autenticados pueden ver documentos"
on "public"."documents_contracts"
as permissive
for select
to authenticated
using (true);



