drop trigger if exists "add_new_document_trigger" on "public"."document_types";

alter table "public"."areas_cliente" enable row level security;

alter table "public"."document_types" add column "conditions" jsonb[];

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.build_employee_where(_conditions jsonb)
 RETURNS text
 LANGUAGE plpgsql
AS $function$DECLARE
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
                    WHERE rel.%I = employees.%I
                      AND rel.%I IN %s)',
          c ->> 'relation_table',
          c ->> 'column_on_relation',
          c ->> 'column_on_employees',
          c ->> 'filter_column',
          ids_txt
        );
      WHEN 'one_to_many' THEN
        parts := parts || format(
          'employees.%I IN %s',
          c ->> 'filter_column',
          ids_txt
        );
      ELSE
        parts := parts || format(
          'employees.%I IN %s',
          c ->> 'filter_column',
          ids_txt
        );
    END CASE;
  END LOOP;

  RETURN array_to_string(parts, ' AND ');
END;$function$
;

CREATE OR REPLACE FUNCTION public.build_employee_where_alias(_conditions jsonb, table_alias text DEFAULT 'e'::text)
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
                      AND rel.%I IN %s)',
          c ->> 'relation_table',
          c ->> 'column_on_relation',
          table_alias,
          c ->> 'column_on_employees',
          c ->> 'filter_column',
          ids_txt
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

CREATE OR REPLACE FUNCTION public.build_vehicle_where(_conditions jsonb)
 RETURNS text
 LANGUAGE plpgsql
AS $function$DECLARE
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
                    WHERE rel.%I = vehicles.%I
                      AND rel.%I IN %s)',
          c ->> 'relation_table',
          c ->> 'column_on_relation',
          -- Aquí el cambio: usa el campo dinámico del JSON, igual que empleados
          COALESCE(c ->> 'column_on_vehicles', 'id'),
          c ->> 'filter_column',
          ids_txt
        );
      WHEN 'one_to_many' THEN
        parts := parts || format(
          'vehicles.%I IN %s',
          c ->> 'filter_column',
          ids_txt
        );
      ELSE
        parts := parts || format(
          'vehicles.%I IN %s',
          c ->> 'filter_column',
          ids_txt
        );
    END CASE;
  END LOOP;

  RETURN array_to_string(parts, ' AND ');
END;$function$
;

CREATE OR REPLACE FUNCTION public.build_vehicle_where_alias(_conditions jsonb, table_alias text DEFAULT 'v'::text)
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
                      AND rel.%I IN %s)',
          c ->> 'relation_table',
          c ->> 'column_on_relation',
          table_alias,
          COALESCE(c ->> 'column_on_vehicles', 'id'),
          c ->> 'filter_column',
          ids_txt
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
        
        -- Cambio aquí: usamos la nueva función con soporte de alias
        where_sql := build_employee_where_alias(conditions_jsonb, 'e');
        
        EXECUTE format('
          INSERT INTO documents_employees (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          SELECT %L, e.id, NULL, ''pendiente'', TRUE, %L, NULL, NULL
          FROM employees e
          WHERE e.company_id = %L AND %s
          AND e.id NOT IN (SELECT de.applies FROM documents_employees de WHERE de.id_document_types = %L)
        ', doc.id, user_id, company_id_var, where_sql, doc.id);
        EXECUTE format('
          DELETE FROM documents_employees de
          WHERE de.id_document_types = %L
            AND de.applies NOT IN (SELECT e.id FROM employees e WHERE e.company_id = %L AND %s)
            AND (de.document_path IS NULL OR de.document_path = '''')
        ', doc.id, company_id_var, where_sql);
        EXECUTE format('
          UPDATE employees e SET status = ''Incompleto''
          WHERE e.company_id = %L AND %s
            AND e.id IN (
              SELECT e2.id FROM employees e2 WHERE e2.company_id = %L AND %s
              EXCEPT
              SELECT de.applies FROM documents_employees de WHERE de.id_document_types = %L
            )
        ', company_id_var, where_sql, company_id_var, where_sql, doc.id);
      ELSE
        INSERT INTO documents_employees (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
        SELECT doc.id, e.id, NULL, 'pendiente', TRUE, user_id, NULL, NULL
        FROM employees e
        WHERE e.company_id = company_id_var
          AND e.id NOT IN (SELECT de.applies FROM documents_employees de WHERE de.id_document_types = doc.id);
        DELETE FROM documents_employees de
        WHERE de.id_document_types = doc.id
          AND de.applies NOT IN (SELECT e.id FROM employees e WHERE e.company_id = company_id_var)
          AND (de.document_path IS NULL OR de.document_path = '');
        UPDATE employees e SET status = 'Incompleto'
        WHERE e.company_id = company_id_var
          AND e.id IN (
            SELECT e2.id FROM employees e2 WHERE e2.company_id = company_id_var
            EXCEPT
            SELECT de.applies FROM documents_employees de WHERE de.id_document_types = doc.id
          );
      END IF;
    ELSIF doc.applies = 'Equipos' THEN
      IF doc.special AND doc.conditions IS NOT NULL AND array_length(doc.conditions, 1) > 0 THEN
        SELECT array_to_json(doc.conditions)::jsonb INTO conditions_jsonb;
        
        -- Cambio aquí: usamos la nueva función con soporte de alias
        where_sql := build_vehicle_where_alias(conditions_jsonb, 'v');
        
        EXECUTE format('
          INSERT INTO documents_equipment (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          SELECT %L, v.id, NULL, ''pendiente'', TRUE, %L, NULL, NULL
          FROM vehicles v
          WHERE v.company_id = %L AND %s
          AND v.id NOT IN (SELECT deq.applies FROM documents_equipment deq WHERE deq.id_document_types = %L)
        ', doc.id, user_id, company_id_var, where_sql, doc.id);
        EXECUTE format('
          DELETE FROM documents_equipment deq
          WHERE deq.id_document_types = %L
            AND deq.applies NOT IN (SELECT v.id FROM vehicles v WHERE v.company_id = %L AND %s)
            AND (deq.document_path IS NULL OR deq.document_path = '''')
        ', doc.id, company_id_var, where_sql);
        EXECUTE format('
          UPDATE vehicles v SET status = ''Incompleto''
          WHERE v.company_id = %L AND %s
            AND v.id IN (
              SELECT v2.id FROM vehicles v2 WHERE v2.company_id = %L AND %s
              EXCEPT
              SELECT deq.applies FROM documents_equipment deq WHERE deq.id_document_types = %L
            )
        ', company_id_var, where_sql, company_id_var, where_sql, doc.id);
      ELSE
        INSERT INTO documents_equipment (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
        SELECT doc.id, v.id, NULL, 'pendiente', TRUE, user_id, NULL, NULL
        FROM vehicles v
        WHERE v.company_id = company_id_var
          AND v.id NOT IN (SELECT deq.applies FROM documents_equipment deq WHERE deq.id_document_types = doc.id);
        DELETE FROM documents_equipment deq
        WHERE deq.id_document_types = doc.id
          AND deq.applies NOT IN (SELECT v.id FROM vehicles v WHERE v.company_id = company_id_var)
          AND (deq.document_path IS NULL OR deq.document_path = '');
        UPDATE vehicles v SET status = 'Incompleto'
        WHERE v.company_id = company_id_var
          AND v.id IN (
            SELECT v2.id FROM vehicles v2 WHERE v2.company_id = company_id_var
            EXCEPT
            SELECT deq.applies FROM documents_equipment deq WHERE deq.id_document_types = doc.id
          );
      END IF;
    END IF;
  END LOOP;
  RAISE LOG 'Fin de controlar_alertas_documentos para company_id=%', company_id_var;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_controlar_alertas_employees()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Nota: la variable NEW contiene la fila que se está insertando/actualizando
  PERFORM controlar_alertas_documentos();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_controlar_alertas_vehicles()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Nota: la variable NEW contiene la fila que se está insertando/actualizando
  PERFORM controlar_alertas_documentos();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_document_types_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Si es mandatorio, verificar solo para este tipo de documento
  IF NEW.mandatory THEN
    -- Ejecuta controlar_alertas_documentos solo para este tipo de documento
    PERFORM controlar_alertas_documentos(NEW.id);
    RAISE LOG 'Trigger document_types: ejecutado controlar_alertas_documentos para document_type_id=%', NEW.id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_document_types_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Si cambió a mandatory o ya era mandatory y se cambiaron las condiciones
  IF NEW.mandatory OR (OLD.mandatory AND NEW.conditions IS DISTINCT FROM OLD.conditions) THEN
    -- Ejecuta controlar_alertas_documentos solo para este tipo de documento
    PERFORM controlar_alertas_documentos(NEW.id);
    RAISE LOG 'Trigger document_types UPDATE: ejecutado controlar_alertas_documentos para document_type_id=%', NEW.id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.add_new_document()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  company_id uuid;
  user_id uuid;
  vehicle_id uuid;
  employee_id uuid;
  where_sql text;
  conditions_jsonb jsonb;
  user_jwt jsonb;
BEGIN
  -----------------------------------------------------------------
  -- Obtener y loguear el JWT y app_metadata
  user_jwt := auth.jwt();
  RAISE LOG 'JWT del usuario: %', user_jwt;
  RAISE LOG 'app_metadata: %', user_jwt->'app_metadata';
  company_id := user_jwt->'app_metadata'->>'company';
  user_id := user_jwt->>'sub';
  RAISE LOG 'company_id tomado del JWT: %', company_id;
  RAISE LOG 'user_id tomado del JWT: %', user_id;
  -----------------------------------------------------------------
  RAISE LOG 'Inicio de función trigger: mandatory=%, applies=%, company_id=%, special=%, conditions=%', 
    NEW.mandatory, NEW.applies, company_id, NEW.special, NEW.conditions;
  IF NEW.mandatory THEN
    /* =======  BLOQUE EQUIPOS  ======= */
    IF NEW.applies = 'Equipos' THEN
      RAISE LOG 'Procesando bloque Equipos';
      IF NEW.special AND NEW.conditions IS NOT NULL AND array_length(NEW.conditions, 1) > 0 THEN
        RAISE LOG 'Equipos: caso especial con condiciones=%', NEW.conditions;
        SELECT array_to_json(NEW.conditions)::jsonb INTO conditions_jsonb;
        where_sql := build_vehicle_where(conditions_jsonb);
        RAISE LOG 'Equipos: where_sql generado=%', where_sql;
        FOR vehicle_id IN EXECUTE format('SELECT id FROM vehicles WHERE company_id = %L AND %s', company_id, where_sql) LOOP
          RAISE LOG 'Equipos: insertando documento para vehicle_id=%', vehicle_id;
          INSERT INTO documents_equipment (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          VALUES (NEW.id, vehicle_id, NULL, 'pendiente', TRUE, user_id, NULL, NULL);
        END LOOP;
        RAISE LOG 'Equipos: actualizando status de vehículos para company_id=%', company_id;
        EXECUTE format('UPDATE vehicles SET status = ''Incompleto'' WHERE company_id = %L AND %s', company_id, where_sql);
      ELSE
        FOR vehicle_id IN SELECT id FROM vehicles WHERE company_id = company_id LOOP
          RAISE LOG 'Equipos: insertando documento para vehicle_id=%', vehicle_id;
          INSERT INTO documents_equipment (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          VALUES (NEW.id, vehicle_id, NULL, 'pendiente', TRUE, user_id, NULL, NULL);
        END LOOP;
        RAISE LOG 'Equipos: actualizando status de vehículos para company_id=%', company_id;
        UPDATE vehicles SET status = 'Incompleto' WHERE company_id = company_id;
      END IF;
    /* =======  BLOQUE PERSONA  ======= */
    ELSIF NEW.applies = 'Persona' THEN
      RAISE LOG 'Procesando bloque Persona';
      IF NEW.special AND NEW.conditions IS NOT NULL AND array_length(NEW.conditions, 1) > 0 THEN
        RAISE LOG 'Persona: caso especial con condiciones=%', NEW.conditions;
        SELECT array_to_json(NEW.conditions)::jsonb INTO conditions_jsonb;
        where_sql := build_employee_where(conditions_jsonb);
        RAISE LOG 'Persona: where_sql generado=%', where_sql;
        FOR employee_id IN EXECUTE format('SELECT id FROM employees WHERE company_id = %L AND %s', company_id, where_sql) LOOP
          RAISE LOG 'Persona: insertando documento para employee_id=%', employee_id;
          INSERT INTO documents_employees (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          VALUES (NEW.id, employee_id, NULL, 'pendiente', TRUE, user_id, NULL, NULL);
        END LOOP;
        RAISE LOG 'Persona: actualizando status de empleados para company_id=%', company_id;
        EXECUTE format('UPDATE employees SET status = ''Incompleto'' WHERE company_id = %L AND %s', company_id, where_sql);
      ELSE
        FOR employee_id IN SELECT id FROM employees WHERE company_id = company_id LOOP
          RAISE LOG 'Persona: insertando documento para employee_id=%', employee_id;
          INSERT INTO documents_employees (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
          VALUES (NEW.id, employee_id, NULL, 'pendiente', TRUE, user_id, NULL, NULL);
        END LOOP;
        RAISE LOG 'Persona: actualizando status de empleados para company_id=%', company_id;
        UPDATE employees SET status = 'Incompleto' WHERE company_id = company_id;
      END IF;
    /* =======  BLOQUE EMPRESA  ======= */
    ELSIF NEW.applies = 'Empresa' THEN
      RAISE LOG 'Procesando bloque Empresa: company_id=%', company_id;
      INSERT INTO documents_company (id_document_types, applies, validity, state, is_active, user_id, deny_reason, document_path)
      VALUES (NEW.id, company_id, NULL, 'pendiente', TRUE, user_id, NULL, NULL);
      RAISE LOG 'Empresa: documento insertado para company_id=%', company_id;
    END IF;
  END IF;
  RAISE LOG 'Fin de función trigger. Retornando NEW';
  RETURN NEW;
END;
$function$
;

CREATE TRIGGER document_types_after_insert AFTER INSERT ON public.document_types FOR EACH ROW EXECUTE FUNCTION trg_document_types_insert();

CREATE TRIGGER document_types_after_update AFTER UPDATE ON public.document_types FOR EACH ROW EXECUTE FUNCTION trg_document_types_update();

CREATE TRIGGER controlar_alertas_employees AFTER UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION trg_controlar_alertas_employees();

CREATE TRIGGER controlar_alertas_vehicles AFTER UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION trg_controlar_alertas_vehicles();


