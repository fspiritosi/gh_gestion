'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function fetchAllContractTypes() {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];

  const { data, error } = await supabase.from('types_of_contract').select('*').returns<ContractType[]>();

  if (error) {
    console.error('Error fetching contract types:', error);
    return [];
  }
  return data;
}

export async function createContractType(contractType: { name: string; description: string | null }) {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  console.log(contractType, 'contractType');

  const { data, error } = await supabase.from('types_of_contract').insert(contractType).returns<ContractType[]>();

  if (error) {
    console.error('Error creating contract type:', error);
    throw new Error('Error creating contract type');
  }
  return data;
}

export async function updateContractType(contractType: {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}) {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  const { data, error } = await supabase
    .from('types_of_contract')
    .update(contractType)
    .eq('id', contractType.id)
    .returns<ContractType[]>();

  if (error) {
    console.error('Error updating contract type:', error);
    throw new Error('Error updating contract type');
  }
  return data;
}

export async function deleteContractType(contractType: { id: string }) {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  const { data, error } = await supabase
    .from('types_of_contract')
    .delete()
    .eq('id', contractType.id)
    .returns<ContractType[]>();

  if (error) {
    console.error('Error deleting contract type:', error);
    throw new Error('Error deleting contract type');
  }
  return data;
}
