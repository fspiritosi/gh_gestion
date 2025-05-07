'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function verifyUserRoleInCompany() {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const user = await getCurrentUser();
  const actualCompany = cookiesStore.get('actualComp')?.value;

  if (!actualCompany || !user) return null;

  // Verificar si el usuario es propietario
  const { data: companies } = await supabase.from('company').select('owner_id').eq('id', actualCompany).single();

  if (companies?.owner_id === user.id) {
    return { role: 'owner' };
  }

  // Verificar si el usuario está compartido
  const { data: sharedUser } = await supabase
    .from('share_company_users')
    .select('role')
    .eq('company_id', actualCompany)
    .eq('profile_id', user.id)
    .single();

  return sharedUser || null;
}

async function getCurrentUser() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
