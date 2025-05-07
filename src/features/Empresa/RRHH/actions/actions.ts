'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { Position, WorkDiagram } from '@/types/types';
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

export async function createWorkDiagram(workDiagram: {
  name: string;
  is_active: boolean;
  active_working_days: number;
  inactive_working_days: number;
  active_novelty: string;
  inactive_novelty: string;
}) {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  const { data, error } = await supabase.from('work-diagram').insert(workDiagram).returns<WorkDiagram[]>();

  if (error) {
    console.error('Error creating work diagram:', error);
    throw new Error('Error creating work diagram');
  }
  return data;
}

export async function updateWorkDiagram(workDiagram: {
  id: string;
  name: string;
  is_active: boolean;
  active_working_days: number;
  inactive_working_days: number;
  active_novelty: string;
  inactive_novelty: string;
}) {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  const { data, error } = await supabase
    .from('work-diagram')
    .update(workDiagram)
    .eq('id', workDiagram.id)
    .returns<WorkDiagram[]>();

  if (error) {
    console.error('Error updating work diagram:', error);
    throw new Error('Error updating work diagram');
  }
  return data;
}

export async function deleteWorkDiagram(workDiagram: { id: string }) {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  const { data, error } = await supabase
    .from('work-diagram')
    .delete()
    .eq('id', workDiagram.id)
    .returns<WorkDiagram[]>();

  if (error) {
    console.error('Error deleting work diagram:', error);
    throw new Error('Error deleting work diagram');
  }
  return data;
}

export async function fetchAllPositions() {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];

  const { data, error } = await supabase
    .from('company_position' as any)
    .select('*')
    .returns<Position[]>();

  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
  return data;
}

export async function createPosition(position: {
  name: string;
  is_active: boolean;
  hierarchical_position_id: string[];
}) {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  console.log(company_id, 'company_id');
  if (!company_id) throw new Error('No company ID found');
  console.log(position, 'position');
  const { data, error } = await supabase
    .from('company_position' as any)
    .insert(position)
    .returns<Position>();

  if (error) {
    console.error('Error creating position:', error);
    throw new Error('Error creating position');
  }
  return data;
}

export async function updatePosition(position: {
  id: string;
  name: string;
  is_active: boolean;
  hierarchical_position_id: string[];
}) {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  const { data, error } = await supabase
    .from('company_position' as any)
    .update(position)
    .eq('id', position.id)
    .returns<Position[]>();

  if (error) {
    console.error('Error updating position:', error);
    throw new Error('Error updating position');
  }
  return data;
}

export async function fetchAllHierarchicalPositions() {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];

  const { data, error } = await supabase.from('hierarchy').select('*').returns<any[]>();

  if (error) {
    console.error('Error fetching hierarchical positions:', error);
    return [];
  }
  return data;
}
