'use server';

import { DbCompany } from '@/features/navbar/types/navbar.types';
import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export const fetchCurrentCompany = async () => {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return null;

  const { data, error } = await supabase.from('company').select('*').eq('id', company_id).single();

  if (error) {
    console.error('Error fetching company:', error);
    return null;
  }
  return data as DbCompany;
};

export const fetchUserCompanies = async (userId: string) => {
  const supabase = supabaseServer();

  // Obtener compañías compartidas
  const { data: sharedCompanies, error: sharedError } = await supabase
    .from('share_company_users')
    .select('company_id (*)')
    .eq('profile_id', userId);

  if (sharedError) {
    console.error('Error fetching shared companies:', sharedError);
    return { sharedCompanies: [], allCompanies: [] };
  }

  // Obtener compañías propias
  const { data: allCompanies, error: ownedError } = await supabase.from('company').select('*').eq('owner_id', userId);

  if (ownedError) {
    console.error('Error fetching owned companies:', ownedError);
    return { sharedCompanies: [], allCompanies: [] };
  }

  return {
    sharedCompanies: (sharedCompanies?.map((sc) => sc.company_id) || []) as DbCompany[],
    allCompanies: (allCompanies || []) as DbCompany[],
  };
};
