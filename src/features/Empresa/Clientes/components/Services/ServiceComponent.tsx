import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs';
import ServiceItemsTable from './ServiceItemsTable';
import ServiceTable from './ServiceTable';
interface measure_unit {
  id: number;
  unit: string;
  simbol: string;
  tipo: string;
}
interface customer {
  id: string;
  name: string;
  is_active: boolean;
}

export default async function ServiceComponent() {
  const URL = process.env.NEXT_PUBLIC_BASE_URL;

  const supabase = supabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value || '';
  const { customers } = await fetch(`${URL}/api/company/customers?actual=${company_id}`).then((e) => e.json());
  const filterCustomers = customers?.filter((client: customer) => client.is_active === true);
  //console.log(filterCustomers)
  const { services } = await fetch(`${URL}/api/services?actual=${company_id}`).then((e) => e.json());
  // const {measure_units}= await fetch(`${URL}/api/meassure`).then((e) => e.json());
  const { items } = await fetch(`${URL}/api/services/items?actual=${company_id}`).then((e) => e.json());

  const { data: measure_units } = await supabase.from('measure_units').select('*');

  //     const channels = supabase.channel('custom-all-channel')
  // .on(
  //   'postgres_changes',
  //   { event: '*', schema: 'public', table: 'customer_services' },
  //   async (payload) => {

  //     const { services } = await fetch(`${URL}/api/services?actual=${company_id}`).then((e) => e.json());
  //   }
  // )
  // .subscribe()

  return (
    <Tabs defaultValue="services">
      <TabsList className="mb-2 bg-gh_contrast/50">
        <TabsTrigger value="services" className="text-gh_orange font-semibold">
          Contratos
        </TabsTrigger>
        <TabsTrigger value="servicesItems" className="text-gh_orange font-semibold">
          Items
        </TabsTrigger>
      </TabsList>
      <TabsContent value="services">
        {services ? (
          <ServiceTable services={services} customers={filterCustomers} company_id={company_id} />
        ) : (
          <div>No hay servicios</div>
        )}
      </TabsContent>
      <TabsContent value="servicesItems">
        {services ? (
          <ServiceItemsTable
            measure_units={measure_units as any}
            customers={filterCustomers}
            services={services}
            company_id={company_id}
            items={items}
          />
        ) : (
          <div>No hay items para mostrar</div>
        )}
      </TabsContent>
    </Tabs>
  );
}
