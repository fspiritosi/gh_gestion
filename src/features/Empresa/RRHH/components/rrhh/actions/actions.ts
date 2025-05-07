'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function fetchAllWorkDiagrams() {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];

  const { data, error } = await supabase.from('work-diagram').select('*');

  if (error) {
    console.error('Error fetching work diagrams:', error);
    return [];
  }
  return data;
}
