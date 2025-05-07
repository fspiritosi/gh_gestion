// import React from 'react'
// // import ViewcomponentInternal from '@/components/ViewComponentInternal'
// import ContractDetail from '@/features/Empresa/Clientes/components/Services/contractDetail'
// import ContractDocuments from '@/features/Empresa/Clientes/components/Services/contractDocuments'
// import Viewcomponent from '@/components/ViewComponent';
// function page({params, searchParams }: { params: { id: string }, searchParams: { tab: string; subtab?: string } }) {
//     const id = params.id as string
//     console.log(id)
//     const viewData = {
//         defaultValue: searchParams?.tab || 'documents',
//         path: `/dashboard/company/actualCompany/${id}/?tab=${searchParams?.tab}`,
//         tabsValues: [
//           {
//             value: 'detail',
//             name: 'Detalle',
//             restricted: [''],
//             content: {
//               title: 'Detalle de contrato',
//               //description: 'Información de la empresa',
//               buttonActioRestricted: [''],
//               buttonAction: '',
//               component: <ContractDetail />,
//             },
//           },
//           {
//             value: 'documents',
//             name: 'Documentos',
//             restricted: [''],
//             content: {
//               title: 'Documentos',
//               //description: 'Información de la empresa',
//               buttonActioRestricted: [''],
//               buttonAction: '',
//               component: <ContractDocuments id={id} />,
//             },
//           },
//           {
//             value: 'items',
//             name: 'Items',
//             restricted: [''],
//             content: {
//               title: 'Items',
//               //description: 'Información de la empresa',
//               buttonActioRestricted: [''],
//               buttonAction: '',
//               component: <div>Items</div>,
//             },
//           },

//         ],
//       }

//   return (
//     <Viewcomponent viewData={viewData} />
//   )
// }

// export default page
import Viewcomponent from '@/components/ViewComponent';
import ContractDetail from '@/features/Empresa/Clientes/components/Services/contractDetail';
import ContractDocuments from '@/features/Empresa/Clientes/components/Services/contractDocuments';

// Define el tipo para las props del componente
interface PageProps {
  params: { id: string };
  searchParams: { tab?: string; subtab?: string };
}

// Define el tipo para los valores de las pestañas
type TabValue = 'detail' | 'documents' | 'items';

function Page({ params, searchParams }: PageProps) {
  const id = params.id;
  const defaultTab: TabValue = 'documents';

  // Valida que el tab sea uno de los valores permitidos
  const currentTab: TabValue = ['detail', 'documents', 'items'].includes(searchParams?.tab || '')
    ? (searchParams?.tab as TabValue)
    : defaultTab;

  const viewData = {
    defaultValue: currentTab,
    path: `/dashboard/company/actualCompany/${id}/?tab=${currentTab}`,
    tabsValues: [
      {
        value: 'detail' as const,
        name: 'Detalle',
        restricted: [''],
        content: {
          title: 'Detalle de contrato',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <ContractDetail id={id} />,
        },
      },
      {
        value: 'documents' as const,
        name: 'Documentos',
        restricted: [''],
        content: {
          title: 'Documentos',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <ContractDocuments id={id} />,
        },
      },
      {
        value: 'items' as const,
        name: 'Items',
        restricted: [''],
        content: {
          title: 'Items',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <div>Items</div>,
        },
      },
    ],
  };

  return <Viewcomponent viewData={viewData} />;
}

export default Page;
