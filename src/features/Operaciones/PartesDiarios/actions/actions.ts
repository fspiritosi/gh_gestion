'use server';
import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function updateDailyReportStatus(id: string, status: boolean) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('dailyreport')
    .update({
      status: status,
    })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}
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
  id,
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
export async function checkDailyReportExists(date: string) {
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('dailyreport')
    .select('id')
    .eq('date', date)
    .eq('company_id', company_id || user?.app_metadata?.company_id || '');

  if (error) {
    console.error('Error checking daily reportsss:', error);
    return false;
  }

  return data.length > 0 ? true : false;
}
export async function createDailyReport(date: string) {
  const supabase = supabaseServer();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('dailyreport')
    .insert({
      date: date,
      company_id: company_id || user?.app_metadata?.company_id || '',
    })
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
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('company_id', company_id || user?.app_metadata?.company_id || '');
  if (error) {
    console.log(error);
  }
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
  const { data, error } = await supabase
    .from('service_items')
    .select('*,measure_units(*)')
    .eq('company_id', company_id || user?.app_metadata?.company_id || '');
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
    .select('*, employees_diagram!inner(*), contractor_employee(*)')
    .eq('is_active', true)
    .eq('employees_diagram.day', day)
    .eq('employees_diagram.month', month)
    .eq('employees_diagram.year', year)
    .eq('company_id', company_id || user?.app_metadata?.company_id || '');

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
    .eq('condition', 'operativo')
    .eq('company_id', company_id || user?.app_metadata?.company_id || '');
  if (error) {
    console.log(error);
    return [];
  }
  return data;
}

type DailyReportRowData = {
  customer_id: string;
  service_id: string;
  item_id: string;
  working_day: string;
  start_time?: string | null;
  end_time?: string | null;
  description?: string;
  daily_report_id: string;
};

export async function createDailyReportRow(rowData: DailyReportRowData) {
  const supabase = supabaseServer();

  const { data, error } = await supabase.from('dailyreportrows').insert([rowData]).select();

  if (error) {
    console.error('Error creating daily report row:', error);
    throw new Error(error.message);
  }

  return data[0];
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

export async function createDailyReportEquipmentRelations(dailyReportRowId: string, equipmentIds: string[]) {
  if (!equipmentIds || equipmentIds.length === 0) return [];

  const supabase = supabaseServer();

  const relations = equipmentIds.map((equipmentId) => ({
    daily_report_row_id: dailyReportRowId,
    equipment_id: equipmentId,
  }));

  const { data, error } = await supabase.from('dailyreportequipmentrelations').insert(relations).select();

  if (error) {
    console.error('Error creating equipment relations:', error);
    throw new Error(error.message);
  }

  return data || [];
}
