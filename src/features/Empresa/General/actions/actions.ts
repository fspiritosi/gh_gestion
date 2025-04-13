'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getCompany() {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];
  const { data, error } = await supabase
    .from('company')
    .select(
      `
    *,
    cities (
      name
    ),
    provinces(
      name
    )
  `
    )
    .eq('id', company_id)
    .returns<Company[]>();

  if (error) {
    console.error('Error fetching cost centers:', error);
    return [];
  }
  return data;
}

export async function fetchAllCostCenters() {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];

  const { data, error } = await supabase.from('cost_center').select('*').returns<CostCenter[]>();

  if (error) {
    console.error('Error fetching cost centers:', error);
    return [];
  }
  return data;
}

export const createCostCenter = async (costCenter: { name: string }) => {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  const { data, error } = await supabase.from('cost_center').insert({ name: costCenter.name }).returns<CostCenter[]>();

  if (error) {
    console.error('Error creating cost center:', error);
    throw new Error('Error creating cost center');
  }
  return data;
};

export const updateCostCenter = async (costCenter: { id: string; name: string; is_active: boolean }) => {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  const { data, error } = await supabase
    .from('cost_center')
    .update({ name: costCenter.name })
    .eq('id', costCenter.id)
    .returns<CostCenter[]>();

  if (error) {
    console.error('Error updating cost center:', error);
    throw new Error('Error updating cost center');
  }
  return data;
};
