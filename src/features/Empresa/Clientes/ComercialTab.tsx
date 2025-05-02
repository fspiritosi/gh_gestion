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
import { supabase } from '../../../../supabase/supabase';
import { columns } from './components/columns';

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
  const { data: customers, error } = await supabase.from('customers').select('*');

  if (error) {
    console.error('Error al obtener los contratistas:', error);
  }
  const contractorCompanies = customers?.filter((company: any) => company.company_id.toString() === actualCompany);
  console.log(tabValue, 'tabValue');
  console.log(subtab, 'subtab hijo');
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
            <DataCustomers columns={columns} data={contractorCompanies || []} localStorageName={localStorageName} />
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
          component: <CustomerTab />,
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
          component: <CustomerEquipmentTab customers={contractorCompanies || []} />,
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
          component: <SectorTabs customers={contractorCompanies || []} />,
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
          component: <ServiceComponent />,
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
