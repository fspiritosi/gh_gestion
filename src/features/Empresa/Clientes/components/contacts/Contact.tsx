import { createFilterOptions } from '@/features/Employees/Empleados/components/utils/utils';
import { BaseDataTable } from '@/shared/components/data-table/base/data-table';
import { cookies } from 'next/headers';
import { supabase } from '../../../../../../supabase/supabase';
import { contactColumns } from '../../../../../app/dashboard/company/actualCompany/contact/columns';

export default async function Contact() {
  const coockiesStore = cookies();
  const actualCompany = coockiesStore.get('actualComp')?.value;
  const saved = coockiesStore.get('contactTable')?.value;
  const savedVisibility = saved ? JSON.parse(saved) : {};
  const { data: contacts, error } = await supabase //pasar a api
    .from('contacts')
    .select('*, customers(id, name)')
    .eq('company_id', actualCompany);

  if (error) {
    console.error('Error fetching customers:', error);
  }

  const contractorCompanies = contacts?.filter((company: any) => company.company_id.toString() === actualCompany);

  const names = createFilterOptions(contractorCompanies, (contact) => contact.name);
  const Email = createFilterOptions(contractorCompanies, (contact) => contact.customer_name);
  const phone = createFilterOptions(contractorCompanies, (contact) => contact.contact_phone);
  const charge = createFilterOptions(contractorCompanies, (contact) => contact.contact_charge);
  const client = createFilterOptions(contractorCompanies, (contact) => contact.customers.name);

  return (
    <BaseDataTable
      columns={contactColumns}
      data={contractorCompanies || []}
      savedVisibility={savedVisibility}
      tableId="contactTable"
      toolbarOptions={{
        filterableColumns: [
          {
            columnId: 'Nombre',
            title: 'Nombre',
            options: names,
          },
          {
            columnId: 'Email',
            title: 'Email',
            options: Email,
          },
          {
            columnId: 'Teléfono',
            title: 'Teléfono',
            options: phone,
          },
          {
            columnId: 'Cliente',
            title: 'Cliente',
            options: client,
          },
          {
            columnId: 'Cargo',
            title: 'Cargo',
            options: charge,
          },
        ],
      }}
    />
  );
}
