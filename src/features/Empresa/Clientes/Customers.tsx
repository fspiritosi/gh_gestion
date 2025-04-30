import { cookies } from 'next/headers';
import { supabase } from '../../../../supabase/supabase';
import ComercialTab from './ComercialTab';
import { columns } from './components/columns';

export default async function Customers() {
  const coockiesStore = cookies();
  const actualCompany = coockiesStore.get('actualComp')?.value;

  const { data: customers, error } = await supabase.from('customers').select('*');

  if (error) {
    console.error('Error al obtener los contratistas:', error);
  }
  const contractorCompanies = customers?.filter((company: any) => company.company_id.toString() === actualCompany);

  return (
    // <div className="">
    <ComercialTab columns={columns} data={contractorCompanies || []} localStorageName="customersColumns" />
    // {/* <Tabs defaultValue="customers">
    //   <CardContent>
    //     <TabsList>
    //       <TabsTrigger value="customers">Clientes</TabsTrigger>
    //       <TabsTrigger value="areas">Areas</TabsTrigger>
    //       <TabsTrigger value="equipos">Equipos Clientes</TabsTrigger>
    //       <TabsTrigger value="sector">Sectores</TabsTrigger>
    //     </TabsList>
    //   </CardContent>
    //   <TabsContent value="customers">
    //     <DataCustomers columns={columns} data={contractorCompanies || []} localStorageName="customersColumns" />
    //     <ComercialTab columns={columns} data={contractorCompanies || []} localStorageName="customersColumns" />
    //   </TabsContent>
    //   <TabsContent value="areas">
    //     <CustomerTab />
    //   </TabsContent>
    //   <TabsContent value="equipos">
    //     <CustomerEquipmentTab customers={contractorCompanies || []} />
    //   </TabsContent>
    //   <TabsContent value="sector">
    //     <SectorTabs customers={contractorCompanies || []} />
    //   </TabsContent>
    // </Tabs> */}
    // </div>
  );
}
