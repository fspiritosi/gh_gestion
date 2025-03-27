'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchCurrentCompany = async () => {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  if (!company_id) return [];

  const companyResponse = await fetch(`${URL}/api/company/?actual=${company_id}`);
  const companyDataResponse = companyResponse.ok ? await companyResponse.json() : null;

  const companyData = companyDataResponse.data[0];

  if (!companyData) {
    console.error('Error fetching company:');
    return null;
  }
  return companyData as Company;
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
