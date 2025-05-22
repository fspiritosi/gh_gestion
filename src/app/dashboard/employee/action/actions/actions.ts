'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function fetchAllCostCenter() {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];

  const { data, error } = await supabase.from('cost_center').select('*');

  if (error) {
    console.error('Error fetching cost centers:', error);
    return [];
  }
  return data;
}

export async function fetchContractorCompanies() {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];

  const { data, error } = await supabase.from('customers').select('*');

  if (error) {
    console.error('Error fetching contractor companies:', error);
    return [];
  }
  return data;
}

export async function fetchAllCompanyPositon() {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];

  const { data, error } = await supabase.from('company_position' as any).select('*');

  if (error) {
    console.error('Error fetching company positions:', error);
    return [];
  }
  return data;
}
