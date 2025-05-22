// import Viewcomponent from '@/components/ViewComponent';
// import ContractDetail from '@/features/Empresa/Clientes/components/Services/contractDetail';
// import ContractDocuments from '@/features/Empresa/Clientes/components/Services/contractDocuments';

// // Define el tipo para las props del componente
// interface PageProps {
//   params: { id: string };
//   searchParams: { tab?: string; subtab?: string };
// }

// // Define el tipo para los valores de las pestañas
// type TabValue = 'detail' | 'documents' | 'items';

// function ModalDetail({ params, searchParams }: PageProps) {
//   const id = params.id;
//   const defaultTab: TabValue = 'documents';

//   // Valida que el tab sea uno de los valores permitidos
//   const currentTab: TabValue = ['detail', 'documents', 'items'].includes(searchParams?.tab || '')
//     ? (searchParams?.tab as TabValue)
//     : defaultTab;

//   const viewData = {
//     defaultValue: currentTab,
//     path: `/dashboard/company/actualCompany/${id}/?tab=${currentTab}`,
//     tabsValues: [
//       {
//         value: 'detail' as const,
//         name: 'Detalle',
//         restricted: [''],
//         content: {
//           title: 'Detalle de contrato',
//           buttonActioRestricted: [''],
//           buttonAction: '',
//           component: <ContractDetail id={id} />,
//         },
//       },
//       {
//         value: 'documents' as const,
//         name: 'Documentos',
//         restricted: [''],
//         content: {
//           title: 'Documentos',
//           buttonActioRestricted: [''],
//           buttonAction: '',
//           component: <ContractDocuments id={id} />,
//         },
//       },
//       {
//         value: 'items' as const,
//         name: 'Items',
//         restricted: [''],
//         content: {
//           title: 'Items',
//           buttonActioRestricted: [''],
//           buttonAction: '',
//           component: <div>Items</div>,
//         },
//       },
//     ],
//   };

//   return <Viewcomponent viewData={viewData} />;
// }

// export default ModalDetail;
