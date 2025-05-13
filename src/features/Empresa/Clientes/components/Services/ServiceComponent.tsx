import { fetchAllSectors } from '@/features/Empresa/Clientes/actions/create';
import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { fetchAreasWithProvinces } from '../../actions/create';
import { fetchCustomers } from '../../actions/customer';
import { fetchServiceItems } from '../../actions/items';
import { fetchMeasureUnits } from '../../actions/meassure';
import { fetchServices } from '../../actions/service';
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
  is_active: boolean | null;
  address: string | null;
  client_email: string | null;
  client_phone: number | null;
  company_id: string;
  created_at: string;
  cuit: number;
  reason_for_termination: string | null;
  termination_date: string | null;
}
interface ServiceComponentProps {
  id?: string;
}

export default async function ServiceComponent({ id }: ServiceComponentProps) {
  const URL = process.env.NEXT_PUBLIC_BASE_URL;

  const supabase = supabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value || '';

  const customers = await fetchCustomers(company_id);
  const filterCustomers = customers?.filter(
    (client: customer) => client.is_active === true || client.is_active === null
  );

  const services = await fetchServices(company_id);
  const service = services?.find((s: any) => s.id === id);

  const items = await fetchServiceItems(id || '');

  const measure_units = await fetchMeasureUnits();

  const areas = await fetchAreasWithProvinces();
  const { sectors: Sector } = await fetchAllSectors();

  return (
    <div>
      <ServiceTable
        services={services as any}
        customers={filterCustomers}
        company_id={company_id}
        areas={areas.areasWithProvinces}
        sectors={Sector}
        id={id}
        measure_units={measure_units as any}
        items={items as any}
      />
    </div>
  );
}
