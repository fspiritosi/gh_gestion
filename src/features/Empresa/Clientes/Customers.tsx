import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cookies } from 'next/headers';
import { supabase } from '../../../../supabase/supabase';
import { columns } from './components/columns';
import CustomerTab from './components/customerTab';
import { DataCustomers } from './components/data-customer';

export default async function Customers() {
  const coockiesStore = cookies();
  const actualCompany = coockiesStore.get('actualComp')?.value;

  const { data: customers, error } = await supabase.from('customers').select('*');

  if (error) {
    console.error('Error al obtener los contratistas:', error);
  }
  const contractorCompanies = customers?.filter((company: any) => company.company_id.toString() === actualCompany);

  return (
    <div>
      <Tabs defaultValue="areas">
        <CardContent>
          <TabsList>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="areas">Areas</TabsTrigger>
          </TabsList>
        </CardContent>
        <TabsContent value="customers">
          <DataCustomers columns={columns} data={contractorCompanies || []} localStorageName="customersColumns" />
        </TabsContent>
        <TabsContent value="areas">
          <CustomerTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
