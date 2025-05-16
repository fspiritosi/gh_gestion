alter table "public"."customer_services" drop constraint "public_customer_services_customer_id_fkey";

alter table "public"."service_areas" enable row level security;

alter table "public"."service_sectors" enable row level security;

alter table "public"."customer_services" add constraint "customer_services_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE not valid;

alter table "public"."customer_services" validate constraint "customer_services_customer_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.build_vehicle_where_alias(_conditions jsonb, table_alias text DEFAULT 'v'::text, user_id uuid DEFAULT NULL::uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  c       jsonb;
  parts   text[] := '{}';
  ids_txt text;
BEGIN
  IF _conditions IS NULL OR jsonb_typeof(_conditions) <> 'array' THEN
     RETURN 'TRUE';
  END IF;

  FOR c IN SELECT * FROM jsonb_array_elements(_conditions) LOOP
    SELECT '(' || string_agg(quote_literal(id), ',') || ')'
      INTO ids_txt
      FROM jsonb_array_elements_text(c -> 'ids') id;

    CASE c ->> 'relation_type'
      WHEN 'many_to_many' THEN
        parts := parts || format(
          'EXISTS (SELECT 1 FROM %I rel
                    WHERE rel.%I = %I.%I
                      AND rel.%I IN %s
                      AND rel.user_id = %L)',
          c ->> 'relation_table',
          c ->> 'column_on_relation',
          table_alias,
          COALESCE(c ->> 'column_on_vehicles', 'id'),
          c ->> 'filter_column',
          ids_txt,
          user_id
        );
      WHEN 'one_to_many' THEN
        parts := parts || format(
          '%I.%I IN %s',
          table_alias,
          c ->> 'filter_column',
          ids_txt
        );
      ELSE
        parts := parts || format(
          '%I.%I IN %s',
          table_alias,
          c ->> 'filter_column',
          ids_txt
        );
    END CASE;
  END LOOP;

  RETURN array_to_string(parts, ' AND ');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.controlar_alertas_documentos(tipo_documento_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  company_id_var uuid;
  user_jwt jsonb;
  user_id uuid;
  doc RECORD;
  where_sql text;
  conditions_jsonb jsonb;
BEGIN
  user_jwt := auth.jwt();
  company_id_var := user_jwt->'app_metadata'->>'company';
  user_id := user_jwt->>'sub';
  RAISE LOG 'controlar_alertas_documentos: company_id=% user_id=% tipo_documento_id=%', company_id_var, user_id, tipo_documento_id;

  FOR doc IN
    SELECT * FROM document_types
    WHERE mandatory
      AND applies IN ('Persona', 'Equipos')
      AND (tipo_documento_id IS NULL OR id = tipo_documento_id)
  LOOP
    IF doc.applies = 'Persona' THEN
      IF doc.special AND doc.conditions IS NOT NULL AND array_length(doc.conditions, 1) > 0 THEN
        SELECT array_to_json(doc.conditions)::jsonb INTO conditions_jsonb;
        where_sql := build_employee_where_alias(conditions_jsonb, 'e');
        
        EXECUTE format(
          'INSERT INTO documents_employees (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          SELECT %L, e.id, NULL, ''pendiente'', TRUE, %L, NULL, NULL
          FROM employees e
          WHERE e.company_id = %L AND %s
          AND e.id NOT IN (SELECT de.applies FROM documents_employees de WHERE de.id_document_types = %L)',
          doc.id, user_id, company_id_var, where_sql, doc.id
        );
        EXECUTE format(
          'DELETE FROM documents_employees de
          WHERE de.id_document_types = %L
            AND de.applies NOT IN (SELECT e.id FROM employees e WHERE e.company_id = %L AND %s)
            AND (de.document_path IS NULL OR de.document_path = '''')',
          doc.id, company_id_var, where_sql
        );
        EXECUTE format(
          'UPDATE employees e SET status = ''Incompleto''
          WHERE e.company_id = %L AND %s
            AND e.id IN (
              SELECT e2.id FROM employees e2 WHERE e2.company_id = %L AND %s
              EXCEPT
              SELECT de.applies FROM documents_employees de WHERE de.id_document_types = %L
            )',
          company_id_var, where_sql, company_id_var, where_sql, doc.id
        );
      END IF;
    ELSE
      IF doc.special AND doc.conditions IS NOT NULL AND array_length(doc.conditions, 1) > 0 THEN
        SELECT array_to_json(doc.conditions)::jsonb INTO conditions_jsonb;
        where_sql := build_vehicle_where_alias(conditions_jsonb, 'v', user_id);
        
        EXECUTE format(
          'INSERT INTO documents_equipment (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          SELECT %L, v.id, NULL, ''pendiente'', TRUE, %L, NULL, NULL
          FROM vehicles v
          WHERE v.company_id = %L AND %s
          AND v.id NOT IN (SELECT deq.applies FROM documents_equipment deq WHERE deq.id_document_types = %L)',
          doc.id, user_id, company_id_var, where_sql, doc.id
        );
        EXECUTE format(
          'DELETE FROM documents_equipment deq
          WHERE deq.id_document_types = %L
            AND deq.applies NOT IN (SELECT v.id FROM vehicles v WHERE v.company_id = %L AND %s)
            AND (deq.document_path IS NULL OR deq.document_path = '''')',
          doc.id, company_id_var, where_sql
        );
        EXECUTE format(
          'UPDATE vehicles v SET status = ''Incompleto''
          WHERE v.company_id = %L AND %s
            AND v.id IN (
              SELECT v2.id FROM vehicles v2 WHERE v2.company_id = %L AND %s
              EXCEPT
              SELECT deq.applies FROM documents_equipment deq WHERE deq.id_document_types = %L
            )',
          company_id_var, where_sql, company_id_var, where_sql, doc.id
        );
      ELSE
        EXECUTE format(
          'INSERT INTO documents_equipment (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          SELECT %L, v.id, NULL, ''pendiente'', TRUE, %L, NULL, NULL
          FROM vehicles v
          WHERE v.company_id = %L
            AND v.id NOT IN (SELECT deq.applies FROM documents_equipment deq WHERE deq.id_document_types = %L)',
          doc.id, user_id, company_id_var, doc.id
        );
        
        EXECUTE format(
          'DELETE FROM documents_equipment deq
          WHERE deq.id_document_types = %L
            AND deq.applies NOT IN (SELECT v.id FROM vehicles v WHERE v.company_id = %L)
            AND (deq.document_path IS NULL OR deq.document_path = '''')',
          doc.id, company_id_var
        );
        
        EXECUTE format(
          'UPDATE vehicles v SET status = ''Incompleto''
          WHERE v.company_id = %L
            AND v.id IN (
              SELECT v2.id FROM vehicles v2 WHERE v2.company_id = %L
              EXCEPT
              SELECT deq.applies FROM documents_equipment deq WHERE deq.id_document_types = %L
            )',
          company_id_var, company_id_var, doc.id
        );
      END IF;
    END IF;
  END LOOP;
  RAISE LOG 'Fin de controlar_alertas_documentos para company_id=%', company_id_var;
END;
$function$
;

create policy "Permitir todo"
on "public"."service_areas"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Permitir todo"
on "public"."service_sectors"
as permissive
for all
to authenticated
using (true)
with check (true);



