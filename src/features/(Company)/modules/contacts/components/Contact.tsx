import { DataContacts } from '@/app/dashboard/company/actualCompany/contact/data-table';
import { cookies } from 'next/headers';
import { supabase } from '../../../../../../supabase/supabase';
import { columns } from './ui/columns';

export default async function Contact() {
  const coockiesStore = cookies();
  const actualCompany = coockiesStore.get('actualComp')?.value;
  console.log(actualCompany);
  const { data: contacts, error } = await supabase //pasar a api
    .from('contacts')
    .select('*, customers(id, name)')
    .eq('company_id', actualCompany);

  if (error) {
    console.error('Error fetching customers:', error);
  }

  const contractorCompanies = contacts?.filter((company: any) => company.company_id.toString() === actualCompany);
  console.log(contractorCompanies);
  return (
    <section>
      <DataContacts columns={columns} data={contractorCompanies || []} localStorageName="contactColums" />
    </section>
  );
}
