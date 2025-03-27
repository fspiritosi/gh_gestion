import { cookies } from 'next/headers';
import { supabase } from '../../../../../../supabase/supabase';
import { columns } from './ui/columns';
import { DataCustomers } from './ui/data-table';

export default async function Customers() {
  const coockiesStore = cookies();
  const actualCompany = coockiesStore.get('actualComp')?.value;

  const { data: customers, error } = await supabase.from('customers').select('*');
  console.log(customers);
  if (error) {
    console.error('Error al obtener los contratistas:', error);
    return [];
  }
  const contractorCompanies = customers?.filter((company: any) => company.company_id.toString() === actualCompany);
  console.log(contractorCompanies);
  return (
    <div>
      <DataCustomers columns={columns} data={contractorCompanies || []} localStorageName="customersColumns" />
    </div>
  );
}
