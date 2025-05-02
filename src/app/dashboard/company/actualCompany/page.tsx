import CompanySkeleton from '@/components/Skeletons/CompanySkeleton';
import Viewcomponent from '@/components/ViewComponent';
import { buttonVariants } from '@/components/ui/button';
import General from '@/features/Empresa/General/General';
import RrhhComponent from '@/features/Empresa/RRHH/components/rrhh/rrhhComponent';
import Link from 'next/link';
import { Suspense } from 'react';
// import Customers from '../../../../features/Empresa/Clientes/Customers';
import ComercialTab from '@/features/Empresa/Clientes/ComercialTab';

export default async function CompanyPage({ searchParams }: { searchParams: { tab: string; subtab?: string } }) {
  console.log(searchParams, 'searchParams');
  const viewData = {
    defaultValue: searchParams?.tab || 'general',
    path: '/dashboard/company/actualCompany',
    tabsValues: [
      {
        value: 'general',
        name: 'General',
        restricted: [''],
        content: {
          title: 'Empresa',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <General tabValue="general" subtab={searchParams?.subtab} />,
        },
      },
      // {
      //   value: '"documentacion"',
      //   name: 'Documentacion',
      //   restricted: [''],

      //   content: {
      //     title: 'Documentos empresa',
      //     //description: 'Lista de documentos a nombre de la empresa',
      //     buttonActioRestricted: [''],
      //     buttonAction: (
      //       <div className="flex gap-4 flex-wrap pl-6">
      //         <TypesDocumentAction optionChildrenProp="Empresa" />
      //       </div>
      //     ),
      //     component: <DocumentTabComponent />,
      //   },
      // },
      // {
      //   value: 'users',
      //   name: 'Usuarios',
      //   restricted: [''],

      //   content: {
      //     title: 'Usuarios',
      //     //description: 'Lista de usuarios de la empresa',
      //     buttonActioRestricted: [''],
      //     buttonAction: <RegisterWithRole />,
      //     component: <UsersTabComponent />,
      //   },
      // },
      {
        value: 'comerce',
        name: 'Comercial',
        restricted: [''],
        content: {
          title: 'Comercial',
          //description: 'Lista de clientes de la empresa',
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
            <ComercialTab tabValue="comerce" subtab={searchParams?.subtab} localStorageName="customersColumns" />
          ),
        },
      },
      // {
      //   value: 'contacts',
      //   name: 'Contactos',
      //   restricted: [''],
      //   content: {
      //     title: 'Contactos',
      //     //description: 'Lista de contactos de la empresa',
      //     buttonActioRestricted: [''],
      //     buttonAction: (
      //       <Link
      //         href={'/dashboard/company/contact/action?action=new'}
      //         className={buttonVariants({ variant: 'gh_orange', size: 'sm', className: 'font-semibold' })}
      //       >
      //         Registrar Contacto
      //       </Link>
      //     ),
      //     component: <Contacts />,
      //   },
      // },
      // {
      //   value: 'covenant',
      //   name: 'Convenios colectivos de trabajo',
      //   restricted: [''],
      //   content: {
      //     title: 'Convenios colectivos de trabajo',
      //     description: 'Lista de Convenios colectivos de trabajo',
      //     buttonActioRestricted: [''],
      //     // buttonAction: <CovenantRegister />,
      //     component: <CovenantTreeFile />,
      //   },
      // },
      // {
      //   value: 'forms',
      //   name: 'Formularios',
      //   restricted: [],
      //   content: {
      //     title: 'Formularios',
      //     description: 'Formularios de empresa',
      //     buttonActioRestricted: [''],
      //     // buttonAction: <TypesDocumentAction optionChildrenProp="Personas" />,
      //     component: <CreatedForm />,
      //   },
      // },
      // {
      //   value: 'service',
      //   name: 'Contratos',
      //   restricted: [''],
      //   content: {
      //     title: 'Contratos o Servicios',
      //     //description: 'Crear y ver servicios de la empresa',
      //     buttonActioRestricted: [''],
      //     buttonAction: '',
      //     component: <ServiceComponent />,
      //   },
      // },
      {
        value: 'rrhh',
        name: 'RRHH',
        restricted: [''],
        content: {
          title: 'RRHH',
          //description: 'Crear y ver RRHH de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <RrhhComponent tabValue="rrhh" subtab={searchParams?.subtab} localStorageName="rrhhColumns" />,
        },
      },
      // {
      //   value:"modules",
      //   name:"Módulos",
      //   restricted:[""],
      //   content:{
      //     title:"Módulos habilitados",
      //     description:"Lista de módulos habilitados",
      //     buttonAction:(
      //       ""
      //     ),
      //     component:<div>Modulos</div>
      //   }

      // },
    ],
  };

  return (
    <Suspense fallback={<CompanySkeleton />}>
      <Viewcomponent viewData={viewData} />
    </Suspense>
  );
}
