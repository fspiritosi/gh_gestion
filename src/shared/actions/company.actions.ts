'use server';

import { getCurrentUserProfile } from '@/features/(Layout)/navbar/actions/actions.navbar';
import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchCurrentCompany = async () => {
  'use server';
  const supabase = supabaseServer();
  const cookieStore = cookies();
  let company_id = cookieStore.get('actualComp')?.value;

  if (!company_id) {
    console.log('qui');
    const user = await getCurrentUserProfile();
    console.log(user);
    const { allCompanies, sharedCompanies } = await fetchUserCompanies(user?.id || '');
    const firstCompany = allCompanies[0] || sharedCompanies[0];
    console.log(firstCompany);
    if (firstCompany) {
      console.log(firstCompany.id);
      // Establecer cookie desde el servidor
      cookieStore.set('actualComp', firstCompany.id);
      company_id = firstCompany.id;
    }
  }

  const { data: company, error } = await supabase
    .from('company')
    .select('*')
    .eq('id', company_id || '');

  if (error) {
    console.error('Error fetching company:', error);
    return null;
  }
  return company;
};

export const fetchUserCompanies = async (userId: string) => {
  const supabase = supabaseServer();

  // Obtener compañías compartidas
  const { data: sharedCompanies, error: sharedError } = await supabase
    .from('share_company_users')
    .select('company_id (*)')
    .eq('profile_id', userId)
    .returns<SharedCompanyWithCompany[]>();

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
    sharedCompanies: sharedCompanies?.map((sc) => sc.company_id) as Company[],
    allCompanies: allCompanies || [],
  };
};
