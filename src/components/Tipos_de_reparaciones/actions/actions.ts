'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function fetchAllTypesOfRepairs() {
  const supabase = supabaseServer();
  const cookieStore = cookies();
  const company_id = cookieStore.get('actualComp')?.value;

  if (!company_id) {
    return [];
  }

  try {
    let { data: types_of_repairs, error } = await supabase
      .from('types_of_repairs')
      .select('*')
      .eq('company_id', company_id || '');

    if (error) {
      console.log(error);
      return [];
    }
    return types_of_repairs || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
