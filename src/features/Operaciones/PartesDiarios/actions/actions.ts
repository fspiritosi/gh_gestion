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
  const { data, error } = await supabase.from('customers').select('*');
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
  const { data, error } = await supabase.from('service_items').select('*,measure_units(*)');
  if (error) {
    console.log(error);
  }
  return data;
}
