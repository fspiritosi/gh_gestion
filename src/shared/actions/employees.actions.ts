'use server';

import { fetchCurrentUser } from '@/app/server/GET/actions';
import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export const fetchAllEmployees = async (role?: string) => {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  const user = await fetchCurrentUser();
  // console.log(company_id, 'company_id');
  if (!company_id) return [];

  // console.log(user, 'user');

  if (role === 'Invitado') {
    const { data, error } = await supabase
      .from('share_company_users')
      .select(
        `*,customer_id(*,contractor_employee(*,employee_id(*,hierarchical_position(*),city(*),province(*),workflow_diagram(*),birthplace(*))))`
      )
      .eq('profile_id', user?.id || '')
      .eq('company_id', company_id)
      .returns<ShareCompanyUsersWithRelations[]>();

    const employees = data?.[0].customer_id?.contractor_employee as any;
    const allEmployees = employees?.map((employee: any) => employee.employee_id) as EmployeeDetailed[];
    return allEmployees || [];
  }

  const { data, error } = await supabase
    .from('employees')
    .select(
      '*,hierarchical_position(*),city(*),province(*),workflow_diagram(*),birthplace(*),contractor_employee(*,contractor_id(*))'
    )
    .eq('company_id', company_id)
    .returns<EmployeeDetailed[]>();

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data;
};

export const fetchAllEmployeesInactives = async (role?: string) => {
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const company_id = cookiesStore.get('actualComp')?.value;
  const user = await fetchCurrentUser();
  // console.log(company_id, 'company_id');
  if (!company_id) return [];

  // console.log(user, 'user');

  if (role === 'Invitado') {
    const { data, error } = await supabase
      .from('share_company_users')
      .select(
        `*,customer_id(*,contractor_employee(*,employee_id(*,hierarchical_position(*),city(*),province(*),workflow_diagram(*),birthplace(*))))`
      )
      .eq('profile_id', user?.id || '')
      .eq('company_id', company_id)
      .eq('customer_id.employee_id.is_active', false)
      .returns<ShareCompanyUsersWithRelations[]>();

    const employees = data?.[0].customer_id?.contractor_employee as any;
    const allEmployees = employees?.map((employee: any) => employee.employee_id) as EmployeeDetailed[];
    return allEmployees || [];
  }

  const { data, error } = await supabase
    .from('employees')
    .select(
      '*,hierarchical_position(*),city(*),province(*),workflow_diagram(*),birthplace(*),contractor_employee(*,contractor_id(*))'
    )
    .eq('is_active', false)
    .eq('company_id', company_id)
    .returns<EmployeeDetailed[]>();

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data;
};
