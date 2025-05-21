'use server';
import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// export async function updateDailyReportStatus(id: string, status: string) {
//   const supabase = supabaseServer();
//   const { data, error } = await supabase
//     .from('dailyreport')
//     .update({
//       status: status,
//     })
//     .eq('id', id)
//     .select();

//   if (error) {
//     throw new Error(error.message);
//   }
//   return data;
// }
export async function getDailyReports() {
  const supabase = supabaseServer();

  let { data: dailyReports, error } = await supabase.from('dailyreport').select(`*`).order('date', { ascending: true });

  if (error) {
    console.error('Error fetching daily reports:', error);
    return [];
  }

  return dailyReports || [];
}
export async function getDailyReportById(id: string) {
  const supabase = supabaseServer();

  let { data: dailyReports, error } = await supabase
    .from('dailyreport')
    .select(
      `
    *,
     dailyreportrows(
     *,
  id,
  service_sectors(*,sectors(*)),
  remit_number,
  service_areas(*,areas_cliente(*)),
  service_items(id,item_name),
  customers(id, name),
  customer_services(id,service_name),
  start_time,
  end_time,
  status,
  working_day,
  description,
  document_path,
  dailyreportemployeerelations(employees(id,firstname,lastname)),
  dailyreportequipmentrelations(vehicles(id,intern_number,domain))
)
        `
    )
    .eq('id', id);

  if (error) {
    console.error('Error fetching daily reports:', error);
    return [];
  }

  return dailyReports || [];
}
export async function checkDailyReportExists(date: string[]) {
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('dailyreport')
    .select('*')
    .in('date', date)
    .eq('company_id', company_id || user?.app_metadata?.company_id || '');

  if (error) {
    console.error('Error checking daily reportsss:', error);
    return [];
  }

  return data;
}
export async function createDailyReport(date: string[]) {
  const supabase = supabaseServer();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('dailyreport')
    .insert(
      date.map((date) => ({
        date,
        company_id: company_id || user?.app_metadata?.company_id || '',
      }))
    )
    .select();

  if (error) {
    console.log(error);
  }
  return data;
}
export async function getCustomers() {
  const supabase = supabaseServer();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('customers').select(`
    *,
    equipos_clientes(*),
    customer_services!customer_services_customer_id_fkey(
      *,
      service_sectors(*, sectors(*) ),
      service_areas(*, areas_cliente(*)),
      service_items(*,measure_units(*))  
    )
  `);
  // .eq('company_id', company_id || user?.app_metadata?.company_id || '');
  if (error) {
    console.log(error);
  }
  console.log(
    data?.find((customer) => customer.id === '8af2b620-e8ca-4b97-a198-3514a306d868'),
    'customers'
  );
  return data;
}
export async function getCustomersServices() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('customer_services').select('*');
  if (error) {
    console.log(error);
  }
  return data;
}
export async function getServiceItems() {
  const supabase = supabaseServer();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('service_items').select('*,measure_units(*)');
  // .eq('company_id', company_id || user?.app_metadata?.company_id || '');
  if (error) {
    console.log(error);
  }
  return data;
}

export async function getActiveEmployeesForDailyReport() {
  const supabase = supabaseServer();

  // Obtener la fecha actual
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1; // Los meses en JS van de 0 a 11
  const year = today.getFullYear();

  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('employees')
    .select('employees_diagram!inner(*,diagram_type(*)), contractor_employee(*),*')
    .eq('is_active', true)
    .eq('employees_diagram.day', day)
    .eq('employees_diagram.month', month)
    .eq('employees_diagram.year', year)
    .eq('employees_diagram.diagram_type.work_active', true);

  console.log(data?.[0].employees_diagram?.[0], 'data');

  if (error) {
    console.error('Error al obtener empleados con diagrama:', error);
    return [];
  }

  return data || [];
}
export async function getActiveEquipmentsForDailyReport() {
  const supabase = supabaseServer();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*,contractor_equipment(*)')
    .eq('is_active', true)
    .neq('condition', 'no operativo')
    .neq('condition', 'en reparación')
    .eq('company_id', company_id || user?.app_metadata?.company_id || '');
  if (error) {
    console.error('Error al obtener equipos activos:', error);
    return [];
  }
  return data || [];
}

// Tipos para las relaciones
interface EmployeeRelation {
  id: string;
  employee_id: string;
  daily_report_row_id: string;
  created_at?: string;
}

interface EquipmentRelation {
  id: string;
  equipment_id: string;
  daily_report_row_id: string;
  created_at?: string;
}

// Tipo para la fila del reporte diario
interface DailyReportRowData {
  id?: string;
  daily_report_id: string;
  customer_id: string;
  service_id: string;
  item_id: string;
  working_day: string;
  start_time?: string | null;
  end_time?: string | null;
  description?: string | null;
  areas_customer_id?: string;
  sector_customer_id?: string;
}

export async function updateDailyReportRow(
  id: string,
  data: Partial<DailyReportRowData>,
  employeeIds: string[],
  equipmentIds: string[]
) {
  const supabase = supabaseServer();

  // Actualizar la fila principal
  await updateEmployeeRelations(id, employeeIds);

  // Actualizar relaciones de equipos
  await updateEquipmentRelations(id, equipmentIds);

  const { data: updatedRow, error: updateError } = await supabase
    .from('dailyreportrows')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Error al actualizar la fila:', updateError);
    throw updateError;
  }
  // Actualizar relaciones de empleados

  return updatedRow;
}

export async function updateEmployeeRelations(rowId: string, employeeIds: string[]) {
  const supabase = supabaseServer();

  try {
    // Obtener relaciones existentes
    const { data: existingRelations, error: fetchError } = await supabase
      .from('dailyreportemployeerelations' as any)
      .select('*')
      .eq('daily_report_row_id', rowId);

    if (fetchError) throw fetchError;

    const currentRelations = (existingRelations || []) as EmployeeRelation[];

    // Encontrar relaciones a eliminar
    const relationsToDelete = currentRelations.filter((rel) => !employeeIds.includes(rel.employee_id));

    // Encontrar empleados a agregar
    const existingEmployeeIds = currentRelations.map((rel) => rel.employee_id);
    const employeeIdsToAdd = employeeIds.filter((id) => !existingEmployeeIds.includes(id));

    // Eliminar relaciones
    if (relationsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('dailyreportemployeerelations' as any)
        .delete()
        .in(
          'id',
          relationsToDelete.map((r) => r.id)
        );

      if (deleteError) throw deleteError;
    }

    // Usar la función existente para crear nuevas relaciones
    if (employeeIdsToAdd.length > 0) {
      await createDailyReportEmployeeRelations(rowId, employeeIdsToAdd);
    }
  } catch (error) {
    console.error('Error en updateEmployeeRelations:', error);
    throw error;
  }
}

export async function updateEquipmentRelations(rowId: string, equipmentIds: string[]) {
  const supabase = supabaseServer();

  try {
    // Obtener relaciones existentes
    const { data: existingRelations, error: fetchError } = await supabase
      .from('dailyreportequipmentrelations' as any)
      .select('*')
      .eq('daily_report_row_id', rowId);

    if (fetchError) throw fetchError;

    const currentRelations = (existingRelations || []) as EquipmentRelation[];

    // Encontrar relaciones a eliminar
    const relationsToDelete = currentRelations.filter((rel) => !equipmentIds.includes(rel.equipment_id));

    // Encontrar equipos a agregar
    const existingEquipmentIds = currentRelations.map((rel) => rel.equipment_id);
    const equipmentIdsToAdd = equipmentIds.filter((id) => !existingEquipmentIds.includes(id));

    // Eliminar relaciones
    if (relationsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('dailyreportequipmentrelations')
        .delete()
        .in(
          'id',
          relationsToDelete.map((r) => r.id)
        );

      if (deleteError) throw deleteError;
    }

    // Usar la función existente para crear nuevas relaciones
    if (equipmentIdsToAdd.length > 0) {
      await createDailyReportEquipmentRelations(rowId, equipmentIdsToAdd);
    }
  } catch (error) {
    console.error('Error en updateEquipmentRelations:', error);
    throw error;
  }
}

export async function createDailyReportRow(data: Omit<DailyReportRowData, 'id' | 'created_at' | 'updated_at'>[]) {
  const supabase = supabaseServer();

  try {
    // Insertar todas las filas a la vez
    const { data: createdRows, error } = await supabase.from('dailyreportrows').insert(data).select('*');

    if (error) throw error;

    // Verificar que se hayan creado las filas
    if (!createdRows || createdRows.length === 0) {
      throw new Error('No se crearon filas');
    }

    return createdRows;
  } catch (error) {
    console.error('Error creando filas de parte diario:', error);
    throw error;
  }
}

export async function createDailyReportEmployeeRelations(dailyReportRowId: string, employeeIds: string[]) {
  if (!employeeIds || employeeIds.length === 0) return [];

  const supabase = supabaseServer();

  const relations = employeeIds.map((employeeId) => ({
    daily_report_row_id: dailyReportRowId,
    employee_id: employeeId,
  }));

  const { data, error } = await supabase.from('dailyreportemployeerelations').insert(relations).select();

  if (error) {
    console.error('Error creating employee relations:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function deleteDailyReportRow(id: string) {
  const supabase = supabaseServer();

  try {
    // Finalmente eliminamos la fila del reporte
    const { error: rowError } = await supabase.from('dailyreportrows').delete().eq('id', id);

    if (rowError) throw rowError;

    return { success: true };
  } catch (error) {
    console.error('Error deleting daily report row:', error);
    throw error;
  }
}

export async function createDailyReportEquipmentRelations(dailyReportRowId: string, equipmentIds: string[]) {
  if (!equipmentIds || equipmentIds.length === 0) return [];

  const supabase = supabaseServer();

  const relations = equipmentIds.map((equipmentId) => ({
    daily_report_row_id: dailyReportRowId,
    equipment_id: equipmentId,
  }));

  const { data, error } = await supabase
    .from('dailyreportequipmentrelations' as any)
    .insert(relations)
    .select();

  if (error) {
    console.error('Error creating equipment relations:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getCustomersAreas(customerIds: string[]) {
  const supabase = supabaseServer();

  const { data, error } = await supabase.from('areas_cliente').select('*').in('customer_id', customerIds);
  if (error) {
    return [];
    console.log(error);
  }
  return data;
}
export async function getCustomersSectors(customerIds: string[]) {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from('sector_customer')
    .select('*,customers(*),sectors(*)')
    .in('customer_id', customerIds);
  if (error) {
    console.log(error);
    return [];
  }
  return data;
}
