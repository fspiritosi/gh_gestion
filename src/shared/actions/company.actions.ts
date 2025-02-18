'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export const fetchCurrentCompany = async () => {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];

  const { data, error } = await supabase.from('company').select('*').eq('id', company_id);

  if (error) {
    console.error('Error fetching company:', error);
    return [];
  }
  return data || [];
};
