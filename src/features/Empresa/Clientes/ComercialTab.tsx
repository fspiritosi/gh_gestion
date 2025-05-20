import { fetchAllProvinces } from '@/app/server/GET/actions';
import ViewcomponentInternal from '@/components/ViewComponentInternal';
import { buttonVariants } from '@/components/ui/button';
import ServiceComponent from '@/features/Empresa/Clientes/components/Services/ServiceComponent';
import Contacts from '@/features/Empresa/Clientes/components/contacts/Contact';
import CustomerTab from '@/features/Empresa/Clientes/components/customerTab';
import { DataCustomers } from '@/features/Empresa/Clientes/components/data-customer';
import CustomerEquipmentTab from '@/features/Empresa/Clientes/components/equipos/customerEquipmentTab';
import SectorTabs from '@/features/Empresa/Clientes/components/sector_clientes/sectorTabs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { fechAllCustomers, fetchAllSectors, fetchAreasWithProvinces, fetchEquipmentsCustomers } from './actions/create';
import { fetchServiceItems } from './actions/items';
import { fetchMeasureUnits } from './actions/meassure';
import { fetchServices } from './actions/service';
import { columnsCustomers } from './components/columns';

async function ComercialTab({
  tabValue,
  subtab,
  localStorageName,
}: {
  localStorageName: string;
  subtab?: string;
  tabValue: string;
}) {
  const coockiesStore = cookies();
  const actualCompany = coockiesStore.get('actualComp')?.value;
  console.log(actualCompany);
  const customers = await fechAllCustomers();
  const contractorCompanies = customers?.filter((company) => company.company_id.toString() === actualCompany);
  const provinces = await fetchAllProvinces();
  const areas = await fetchAreasWithProvinces();
  const sectors = await fetchAllSectors();
  const contractorSectors =
    sectors?.filter((sector) =>
      sector.sector_customer.some((customer) => customer.customers?.company_id === actualCompany)
    ) || [];

  const services = await fetchServices(actualCompany || '');
  console.log(services);
  const serviceItems = await fetchServiceItems('');
  console.log(serviceItems);
  const measure_units = await fetchMeasureUnits();
  console.log(measure_units);
  const equipments = await fetchEquipmentsCustomers();
  const savedCustomers = coockiesStore.get('customers-table')?.value;
  console.log(contractorCompanies);
  const viewData = {
    defaultValue: subtab || 'customers',
    path: '/dashboard/company/actualCompany',
    tabsValues: [
      {
        value: 'customers',
        name: 'Clientes',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Clientes',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: (
            <Link
              href={'/dashboard/company/actualCompany/customers/action?action=new'}
              className={buttonVariants({ variant: 'gh_orange', size: 'sm', className: 'font-semibold' })}
            >
              Registrar Cliente
            </Link>
          ),
          component: (
            <DataCustomers
              columns={columnsCustomers}
              data={contractorCompanies || []}
              savedCustomers={savedCustomers}
            />
          ),
        },
      },
      {
        value: 'areas',
        name: 'Areas',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Areas',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <CustomerTab customers={customers || []} provinces={provinces || []} areas={areas || []} />,
        },
      },
      {
        value: 'equipment',
        name: 'Equipos',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Equipos',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: (
            <CustomerEquipmentTab
              equipments={equipments || []}
              customers={contractorCompanies || []}
              key={actualCompany}
            />
          ),
        },
      },
      {
        value: 'sector',
        name: 'Sectores',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Sectores',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <SectorTabs customers={contractorCompanies || []} sectors={contractorSectors} />,
        },
      },
      {
        value: 'contacts',
        name: 'Contactos',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Contactos',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: (
            <Link
              href={'/dashboard/company/contact/action?action=new'}
              className={buttonVariants({ variant: 'gh_orange', size: 'sm', className: 'font-semibold' })}
            >
              Registrar Contacto
            </Link>
          ),
          component: <Contacts />,
        },
      },
      {
        value: 'service',
        name: 'Contratos',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Contratos',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: [''],
          component: (
            <ServiceComponent
              // id={id}
              customers={contractorCompanies || []}
              areas={areas || []}
              sectors={contractorSectors}
              measure_units={measure_units || []}
              services={services || []}
              items={serviceItems || []}
              company_id={actualCompany || ''}
              itemsList={serviceItems || []}
              measureUnitsList={measure_units || []}
            />
          ),
        },
      },
    ],
  };

  return (
    <div className="px-0">
      <ViewcomponentInternal viewData={viewData} />
    </div>
  );
}

export default ComercialTab;
