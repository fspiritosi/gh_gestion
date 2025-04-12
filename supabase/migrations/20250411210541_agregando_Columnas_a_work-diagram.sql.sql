drop policy "Enable read access for all users" on "public"."work-diagram";

alter table "public"."employees" add column "born_date" date;

alter table "public"."work-diagram" add column "active_novelty" uuid;

alter table "public"."work-diagram" add column "active_working_days" numeric;

alter table "public"."work-diagram" add column "inactive_novelty" uuid;

alter table "public"."work-diagram" add column "inactive_working_days" numeric;

alter table "public"."work-diagram" add constraint "work-diagram_active_novelty_fkey" FOREIGN KEY (active_novelty) REFERENCES diagram_type(id) not valid;

alter table "public"."work-diagram" validate constraint "work-diagram_active_novelty_fkey";

alter table "public"."work-diagram" add constraint "work-diagram_inactive_novelty_fkey" FOREIGN KEY (inactive_novelty) REFERENCES diagram_type(id) not valid;

alter table "public"."work-diagram" validate constraint "work-diagram_inactive_novelty_fkey";

create policy "Permitir a todos"
on "public"."work-diagram"
as permissive
for all
to authenticated
using (true)
with check (true);



