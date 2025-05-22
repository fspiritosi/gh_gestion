-- drop trigger if exists "document_types_after_insert" on "public"."document_types";

-- drop trigger if exists "document_types_after_update" on "public"."document_types";

-- drop trigger if exists "controlar_alertas_employees" on "public"."employees";

-- drop trigger if exists "controlar_alertas_vehicles" on "public"."vehicles";

-- drop policy "Permitir todo" on "public"."service_areas";

-- drop policy "Permitir todo" on "public"."service_sectors";

-- alter table "public"."customer_services" drop constraint "customer_services_customer_id_fkey";

-- drop function if exists "public"."build_employee_where"(_conditions jsonb);

-- drop function if exists "public"."build_employee_where_alias"(_conditions jsonb, table_alias text);

-- drop function if exists "public"."build_vehicle_where"(_conditions jsonb);

-- drop function if exists "public"."build_vehicle_where_alias"(_conditions jsonb, table_alias text);

-- drop function if exists "public"."build_vehicle_where_alias"(_conditions jsonb, table_alias text, user_id uuid);

-- drop function if exists "public"."controlar_alertas_documentos"(tipo_documento_id uuid);

-- drop function if exists "public"."trg_controlar_alertas_employees"();

-- drop function if exists "public"."trg_controlar_alertas_vehicles"();

-- drop function if exists "public"."trg_document_types_insert"();

-- drop function if exists "public"."trg_document_types_update"();

create table "public"."aptitudes_tecnicas" (
    "id" uuid not null default gen_random_uuid(),
    "nombre" text not null,
    "is_active" boolean default true
);


create table "public"."aptitudes_tecnicas_puestos" (
    "aptitud_id" uuid not null,
    "puesto_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."empleado_aptitudes" (
    "id" uuid not null default gen_random_uuid(),
    "empleado_id" uuid not null,
    "aptitud_id" uuid not null,
    "tiene_aptitud" boolean default false,
    "fecha_verificacion" date,
    "observaciones" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."areas_cliente" disable row level security;

alter table "public"."document_types" drop column "conditions";

alter table "public"."service_areas" disable row level security;

alter table "public"."service_sectors" disable row level security;

CREATE UNIQUE INDEX aptitudes_tecnicas_pkey ON public.aptitudes_tecnicas USING btree (id);

CREATE UNIQUE INDEX aptitudes_tecnicas_puestos_pkey ON public.aptitudes_tecnicas_puestos USING btree (aptitud_id, puesto_id);

CREATE UNIQUE INDEX empleado_aptitudes_empleado_id_aptitud_id_key ON public.empleado_aptitudes USING btree (empleado_id, aptitud_id);

CREATE UNIQUE INDEX empleado_aptitudes_pkey ON public.empleado_aptitudes USING btree (id);

CREATE INDEX idx_aptitudes_tecnicas_puestos_puesto_id ON public.aptitudes_tecnicas_puestos USING btree (puesto_id);

alter table "public"."aptitudes_tecnicas" add constraint "aptitudes_tecnicas_pkey" PRIMARY KEY using index "aptitudes_tecnicas_pkey";

alter table "public"."aptitudes_tecnicas_puestos" add constraint "aptitudes_tecnicas_puestos_pkey" PRIMARY KEY using index "aptitudes_tecnicas_puestos_pkey";

alter table "public"."empleado_aptitudes" add constraint "empleado_aptitudes_pkey" PRIMARY KEY using index "empleado_aptitudes_pkey";

alter table "public"."aptitudes_tecnicas_puestos" add constraint "aptitudes_tecnicas_puestos_aptitud_id_fkey" FOREIGN KEY (aptitud_id) REFERENCES aptitudes_tecnicas(id) ON DELETE CASCADE not valid;

alter table "public"."aptitudes_tecnicas_puestos" validate constraint "aptitudes_tecnicas_puestos_aptitud_id_fkey";

alter table "public"."aptitudes_tecnicas_puestos" add constraint "aptitudes_tecnicas_puestos_puesto_id_fkey" FOREIGN KEY (puesto_id) REFERENCES company_position(id) ON DELETE CASCADE not valid;

alter table "public"."aptitudes_tecnicas_puestos" validate constraint "aptitudes_tecnicas_puestos_puesto_id_fkey";

alter table "public"."customer_services" add constraint "public_customer_services_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) not valid;

alter table "public"."customer_services" validate constraint "public_customer_services_customer_id_fkey";

alter table "public"."empleado_aptitudes" add constraint "empleado_aptitudes_aptitud_id_fkey" FOREIGN KEY (aptitud_id) REFERENCES aptitudes_tecnicas(id) ON DELETE CASCADE not valid;

alter table "public"."empleado_aptitudes" validate constraint "empleado_aptitudes_aptitud_id_fkey";

alter table "public"."empleado_aptitudes" add constraint "empleado_aptitudes_empleado_id_aptitud_id_key" UNIQUE using index "empleado_aptitudes_empleado_id_aptitud_id_key";

alter table "public"."empleado_aptitudes" add constraint "empleado_aptitudes_empleado_id_fkey" FOREIGN KEY (empleado_id) REFERENCES employees(id) ON DELETE CASCADE not valid;

alter table "public"."empleado_aptitudes" validate constraint "empleado_aptitudes_empleado_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.add_new_document()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$DECLARE
  company_owner_id UUID;
  vehicle_id UUID;
  employee_id UUID;
BEGIN
  IF NEW.mandatory THEN
    IF NEW.applies = 'Equipos' THEN
      IF NEW.company_id IS NULL THEN
        FOR company_owner_id IN SELECT owner_id FROM company LOOP
          FOR vehicle_id IN SELECT id FROM vehicles WHERE company_id = company_owner_id LOOP
            INSERT INTO documents_equipment (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
            VALUES (NEW.id, vehicle_id, NULL, 'pendiente', TRUE, company_owner_id, NULL, NULL);
          END LOOP;
        END LOOP;
        -- Actualizar el estado de todos los vehículos
        UPDATE vehicles SET status = 'Incompleto' WHERE company_id IN (SELECT owner_id FROM company);
      ELSE
        SELECT owner_id INTO company_owner_id FROM company WHERE id = NEW.company_id;
        FOR vehicle_id IN SELECT id FROM vehicles WHERE company_id = NEW.company_id LOOP
          INSERT INTO documents_equipment (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          VALUES (NEW.id, vehicle_id, NULL, 'pendiente', TRUE, company_owner_id, NULL, NULL);
        END LOOP;
        -- Actualizar el estado de todos los vehículos
        UPDATE vehicles SET status = 'Incompleto' WHERE company_id = NEW.company_id;
      END IF;
    ELSIF NEW.applies = 'Persona' THEN
      IF NEW.company_id IS NULL THEN
        FOR company_owner_id IN SELECT owner_id FROM company LOOP
          FOR employee_id IN SELECT id FROM employees WHERE company_id = company_owner_id LOOP
            INSERT INTO documents_employees (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
            VALUES (NEW.id, employee_id, NULL, 'pendiente', TRUE, company_owner_id, NULL, NULL);
          END LOOP;
        END LOOP;
        -- Actualizar el estado de todos los empleados
        UPDATE employees SET status = 'Incompleto' WHERE company_id IN (SELECT owner_id FROM company);
      ELSE
        SELECT owner_id INTO company_owner_id FROM company WHERE id = NEW.company_id;
        FOR employee_id IN SELECT id FROM employees WHERE company_id = NEW.company_id LOOP
          INSERT INTO documents_employees (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          VALUES (NEW.id, employee_id, NULL, 'pendiente', TRUE, company_owner_id, NULL, NULL);
        END LOOP;
        -- Actualizar el estado de todos los empleados
        UPDATE employees SET status = 'Incompleto' WHERE company_id = NEW.company_id;
      END IF;
    ELSIF NEW.applies = 'Empresa' THEN
      SELECT owner_id INTO company_owner_id FROM company WHERE id = NEW.company_id;
      INSERT INTO documents_company (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
      VALUES (NEW.id, NEW.company_id, NULL, 'pendiente', TRUE, NULL, NULL, NULL);
    END IF;
  END IF;
  RETURN NEW;
END;$function$
;

grant delete on table "public"."aptitudes_tecnicas" to "anon";

grant insert on table "public"."aptitudes_tecnicas" to "anon";

grant references on table "public"."aptitudes_tecnicas" to "anon";

grant select on table "public"."aptitudes_tecnicas" to "anon";

grant trigger on table "public"."aptitudes_tecnicas" to "anon";

grant truncate on table "public"."aptitudes_tecnicas" to "anon";

grant update on table "public"."aptitudes_tecnicas" to "anon";

grant delete on table "public"."aptitudes_tecnicas" to "authenticated";

grant insert on table "public"."aptitudes_tecnicas" to "authenticated";

grant references on table "public"."aptitudes_tecnicas" to "authenticated";

grant select on table "public"."aptitudes_tecnicas" to "authenticated";

grant trigger on table "public"."aptitudes_tecnicas" to "authenticated";

grant truncate on table "public"."aptitudes_tecnicas" to "authenticated";

grant update on table "public"."aptitudes_tecnicas" to "authenticated";

grant delete on table "public"."aptitudes_tecnicas" to "service_role";

grant insert on table "public"."aptitudes_tecnicas" to "service_role";

grant references on table "public"."aptitudes_tecnicas" to "service_role";

grant select on table "public"."aptitudes_tecnicas" to "service_role";

grant trigger on table "public"."aptitudes_tecnicas" to "service_role";

grant truncate on table "public"."aptitudes_tecnicas" to "service_role";

grant update on table "public"."aptitudes_tecnicas" to "service_role";

grant delete on table "public"."aptitudes_tecnicas_puestos" to "anon";

grant insert on table "public"."aptitudes_tecnicas_puestos" to "anon";

grant references on table "public"."aptitudes_tecnicas_puestos" to "anon";

grant select on table "public"."aptitudes_tecnicas_puestos" to "anon";

grant trigger on table "public"."aptitudes_tecnicas_puestos" to "anon";

grant truncate on table "public"."aptitudes_tecnicas_puestos" to "anon";

grant update on table "public"."aptitudes_tecnicas_puestos" to "anon";

grant delete on table "public"."aptitudes_tecnicas_puestos" to "authenticated";

grant insert on table "public"."aptitudes_tecnicas_puestos" to "authenticated";

grant references on table "public"."aptitudes_tecnicas_puestos" to "authenticated";

grant select on table "public"."aptitudes_tecnicas_puestos" to "authenticated";

grant trigger on table "public"."aptitudes_tecnicas_puestos" to "authenticated";

grant truncate on table "public"."aptitudes_tecnicas_puestos" to "authenticated";

grant update on table "public"."aptitudes_tecnicas_puestos" to "authenticated";

grant delete on table "public"."aptitudes_tecnicas_puestos" to "service_role";

grant insert on table "public"."aptitudes_tecnicas_puestos" to "service_role";

grant references on table "public"."aptitudes_tecnicas_puestos" to "service_role";

grant select on table "public"."aptitudes_tecnicas_puestos" to "service_role";

grant trigger on table "public"."aptitudes_tecnicas_puestos" to "service_role";

grant truncate on table "public"."aptitudes_tecnicas_puestos" to "service_role";

grant update on table "public"."aptitudes_tecnicas_puestos" to "service_role";

grant delete on table "public"."empleado_aptitudes" to "anon";

grant insert on table "public"."empleado_aptitudes" to "anon";

grant references on table "public"."empleado_aptitudes" to "anon";

grant select on table "public"."empleado_aptitudes" to "anon";

grant trigger on table "public"."empleado_aptitudes" to "anon";

grant truncate on table "public"."empleado_aptitudes" to "anon";

grant update on table "public"."empleado_aptitudes" to "anon";

grant delete on table "public"."empleado_aptitudes" to "authenticated";

grant insert on table "public"."empleado_aptitudes" to "authenticated";

grant references on table "public"."empleado_aptitudes" to "authenticated";

grant select on table "public"."empleado_aptitudes" to "authenticated";

grant trigger on table "public"."empleado_aptitudes" to "authenticated";

grant truncate on table "public"."empleado_aptitudes" to "authenticated";

grant update on table "public"."empleado_aptitudes" to "authenticated";

grant delete on table "public"."empleado_aptitudes" to "service_role";

grant insert on table "public"."empleado_aptitudes" to "service_role";

grant references on table "public"."empleado_aptitudes" to "service_role";

grant select on table "public"."empleado_aptitudes" to "service_role";

grant trigger on table "public"."empleado_aptitudes" to "service_role";

grant truncate on table "public"."empleado_aptitudes" to "service_role";

grant update on table "public"."empleado_aptitudes" to "service_role";

CREATE TRIGGER add_new_document_trigger AFTER INSERT ON public.document_types FOR EACH ROW EXECUTE FUNCTION add_new_document();

CREATE TRIGGER update_empleado_aptitudes_updated_at BEFORE UPDATE ON public.empleado_aptitudes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


