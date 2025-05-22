'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function fetchContacts() {
  const supabase = supabaseServer();
  const cookieStore = cookies();
  const actualCompany = cookieStore.get('actualComp')?.value;

  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*, customers(id, name)')
      .eq('company_id', actualCompany || '');

    if (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchContacts:', error);
    throw error;
  }
}
