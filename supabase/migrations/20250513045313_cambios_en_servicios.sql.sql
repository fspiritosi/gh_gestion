alter table "public"."customer_services" drop constraint "customer_services_area_id_fkey";

alter table "public"."customer_services" drop constraint "customer_services_sector_id_fkey";

create table "public"."service_areas" (
    "service_id" uuid not null,
    "area_id" uuid not null
);


create table "public"."service_sectors" (
    "id" uuid not null default gen_random_uuid(),
    "service_id" uuid not null,
    "sector_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."customer_services" drop column "area_id";

alter table "public"."customer_services" drop column "sector_id";

CREATE UNIQUE INDEX service_areas_pkey ON public.service_areas USING btree (service_id, area_id);

CREATE UNIQUE INDEX service_sectors_pkey ON public.service_sectors USING btree (id);

CREATE UNIQUE INDEX service_sectors_unique ON public.service_sectors USING btree (service_id, sector_id);

alter table "public"."service_areas" add constraint "service_areas_pkey" PRIMARY KEY using index "service_areas_pkey";

alter table "public"."service_sectors" add constraint "service_sectors_pkey" PRIMARY KEY using index "service_sectors_pkey";

alter table "public"."service_areas" add constraint "fk_area" FOREIGN KEY (area_id) REFERENCES areas_cliente(id) ON DELETE CASCADE not valid;

alter table "public"."service_areas" validate constraint "fk_area";

alter table "public"."service_areas" add constraint "fk_service" FOREIGN KEY (service_id) REFERENCES customer_services(id) ON DELETE CASCADE not valid;

alter table "public"."service_areas" validate constraint "fk_service";

alter table "public"."service_sectors" add constraint "service_sectors_sector_id_fkey" FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE not valid;

alter table "public"."service_sectors" validate constraint "service_sectors_sector_id_fkey";

alter table "public"."service_sectors" add constraint "service_sectors_service_id_fkey" FOREIGN KEY (service_id) REFERENCES customer_services(id) ON DELETE CASCADE not valid;

alter table "public"."service_sectors" validate constraint "service_sectors_service_id_fkey";

alter table "public"."service_sectors" add constraint "service_sectors_unique" UNIQUE using index "service_sectors_unique";

grant delete on table "public"."service_areas" to "anon";

grant insert on table "public"."service_areas" to "anon";

grant references on table "public"."service_areas" to "anon";

grant select on table "public"."service_areas" to "anon";

grant trigger on table "public"."service_areas" to "anon";

grant truncate on table "public"."service_areas" to "anon";

grant update on table "public"."service_areas" to "anon";

grant delete on table "public"."service_areas" to "authenticated";

grant insert on table "public"."service_areas" to "authenticated";

grant references on table "public"."service_areas" to "authenticated";

grant select on table "public"."service_areas" to "authenticated";

grant trigger on table "public"."service_areas" to "authenticated";

grant truncate on table "public"."service_areas" to "authenticated";

grant update on table "public"."service_areas" to "authenticated";

grant delete on table "public"."service_areas" to "service_role";

grant insert on table "public"."service_areas" to "service_role";

grant references on table "public"."service_areas" to "service_role";

grant select on table "public"."service_areas" to "service_role";

grant trigger on table "public"."service_areas" to "service_role";

grant truncate on table "public"."service_areas" to "service_role";

grant update on table "public"."service_areas" to "service_role";

grant delete on table "public"."service_sectors" to "anon";

grant insert on table "public"."service_sectors" to "anon";

grant references on table "public"."service_sectors" to "anon";

grant select on table "public"."service_sectors" to "anon";

grant trigger on table "public"."service_sectors" to "anon";

grant truncate on table "public"."service_sectors" to "anon";

grant update on table "public"."service_sectors" to "anon";

grant delete on table "public"."service_sectors" to "authenticated";

grant insert on table "public"."service_sectors" to "authenticated";

grant references on table "public"."service_sectors" to "authenticated";

grant select on table "public"."service_sectors" to "authenticated";

grant trigger on table "public"."service_sectors" to "authenticated";

grant truncate on table "public"."service_sectors" to "authenticated";

grant update on table "public"."service_sectors" to "authenticated";

grant delete on table "public"."service_sectors" to "service_role";

grant insert on table "public"."service_sectors" to "service_role";

grant references on table "public"."service_sectors" to "service_role";

grant select on table "public"."service_sectors" to "service_role";

grant trigger on table "public"."service_sectors" to "service_role";

grant truncate on table "public"."service_sectors" to "service_role";

grant update on table "public"."service_sectors" to "service_role";


