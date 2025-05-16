'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { Position, WorkDiagram } from '@/types/types';
// import { AptitudTecnica } from '../types/aptitudesTecnicas';
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
  aptitudes_tecnicas_id: string[];
}) {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  try {
    // Primero creamos el puesto
    const { data: positionData, error: positionError } = await supabase
      .from('company_position')
      .insert({
        name: position.name,
        is_active: position.is_active,
        hierarchical_position_id: position.hierarchical_position_id,
      })
      .select()
      .single();

    if (positionError) {
      console.error('Error creating position:', positionError);
      throw new Error('Error creating position');
    }

    if (!positionData?.id) {
      console.error('Position ID not found after creation');
      throw new Error('Position ID not found');
    }

    // Luego creamos las relaciones con las aptitudes técnicas
    if (position.aptitudes_tecnicas_id.length > 0) {
      const aptitudesRelations = position.aptitudes_tecnicas_id.map((aptitudeId) => ({
        position_id: positionData.id,
        aptitude_tecnica_id: aptitudeId,
      }));

      const { error: relationError } = await supabase
        .from('aptitudes_tecnicas_puestos' as any)
        .insert(aptitudesRelations);

      if (relationError) {
        console.error('Error creating aptitudes relations:', relationError);
        throw new Error('Error creating aptitudes relations');
      }
    }

    return positionData;
  } catch (error) {
    console.error('Error in createPosition:', error);
    throw error;
  }
}

export async function updatePosition(position: {
  id: string;
  name: string;
  is_active: boolean;
  hierarchical_position_id: string[];
  aptitudes_tecnicas_id: string[];
}) {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) throw new Error('No company ID found');

  try {
    // Primero actualizamos el puesto
    const { error: positionError } = await supabase
      .from('company_position' as any)
      .update({
        name: position.name,
        is_active: position.is_active,
        hierarchical_position_id: position.hierarchical_position_id,
      })
      .eq('id', position.id);

    if (positionError) {
      console.error('Error updating position:', positionError);
      throw new Error('Error updating position');
    }

    // Luego actualizamos las relaciones con las aptitudes técnicas
    if (position.aptitudes_tecnicas_id.length > 0) {
      // Primero eliminamos las relaciones existentes
      const { error: deleteError } = await supabase
        .from('aptitudes_tecnicas_puestos' as any)
        .delete()
        .eq('puesto_id', position.id);

      if (deleteError) {
        console.error('Error deleting aptitudes relations:', deleteError);
        throw new Error('Error deleting aptitudes relations');
      }

      // Luego creamos las nuevas relaciones
      const aptitudesRelations = position.aptitudes_tecnicas_id.map((aptitudeId) => ({
        puesto_id: position.id,
        aptitud_id: aptitudeId,
      }));

      const { error: insertError } = await supabase
        .from('aptitudes_tecnicas_puestos' as any)
        .insert(aptitudesRelations);

      if (insertError) {
        console.error('Error creating new aptitudes relations:', insertError);
        throw new Error('Error creating new aptitudes relations');
      }
    }

    return position;
  } catch (error) {
    console.error('Error in updatePosition:', error);
    throw error;
  }
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

export async function fetchAllAptitudesTecnicas() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('aptitudes_tecnicas' as any).select('*');

  if (error) {
    console.error('Error fetching aptitudes tecnicas:', error);
    return [];
  }
  return data;
}

export async function fetchPositionAptitudes(positionId: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('aptitudes_tecnicas_puestos' as any)
    .select('aptitudes_tecnicas:aptitud_id(*)')
    .eq('puesto_id', positionId);

  if (error) {
    console.error('Error fetching position aptitudes:', error);
    return [];
  }
  return data?.map((item: any) => item.aptitudes_tecnicas) || [];
}
