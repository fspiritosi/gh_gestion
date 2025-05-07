import CovenantTreeFile from '@/app/dashboard/company/actualCompany/covenant/CovenantTreeFile';
import { fetchDiagramsTypes } from '@/app/server/GET/actions';
import DiagramTypeComponent from '@/components/Diagrams/DiagramTypeComponent';
import ViewComponentInternal from '@/components/ViewComponentInternal';
import { fetchAllContractTypes } from '@/features/Empresa/RRHH/actions/actions';
import ContractTypesTab from '@/features/Empresa/RRHH/components/ContractTypeTab';
import DiagramTypesTab from '@/features/Empresa/RRHH/components/rrhh/diagramTypesTab';
import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import PositionsTab from '../rrhh/company_positions/positionsTab';

interface DiagramType {
  id: string;
  created_at: string;
  name: string;
  company_id: string;
  color: string;
  short_description: string;
  work_active: boolean;
}
export default async function RrhhComponent({
  tabValue,
  subtab,
  localStorageName,
}: {
  localStorageName: string;
  subtab?: string;
  tabValue: string;
}) {
  const URL = process.env.NEXT_PUBLIC_BASE_URL;
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const coockiesStore = cookies();
  const company_id = coockiesStore.get('actualComp')?.value;
  // const { employees } = await fetch(`${URL}/api/employees?actual=${company_id}&user=${user?.id}`).then((e) => e.json());

  // const activeEmploees = setEmployeesToShow(employees?.filter((e: any) => e.is_active));

  // const { data: diagrams } = await fetch(`${URL}/api/employees/diagrams`).then((e) => e.json());
  const diagrams_types = await fetchDiagramsTypes();
  const allContractTypes = await fetchAllContractTypes();
  // const employees2 = await fetchAllActivesEmployees();
  // const diagrams2 = await fetchDiagrams();
  // const diagrams_types2 = await fetchDiagramsTypes();
  const viewData = {
    defaultValue: subtab || 'listado',
    path: '/dashboard/company/actualCompany',
    tabsValues: [
      {
        value: 'listado',
        name: 'Tipos de Diagramas',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Tipos de Diagramas',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <DiagramTypesTab diagrams_types={diagrams_types} />,
        },
      },
      {
        value: 'diagrams',
        name: 'Tipos de Novedades',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Tipos de Novedades',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <DiagramTypeComponent diagrams_types={diagrams_types} />,
        },
      },
      {
        value: 'convenios',
        name: 'CCT',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'CCT',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <CovenantTreeFile />,
        },
      },
      {
        value: 'contract-types',
        name: 'Tipos de Contrato',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Tipos de Contrato',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <ContractTypesTab allContractTypes={allContractTypes} />,
        },
      },
      {
        value: 'positions',
        name: 'Puestos',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Puestos',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <PositionsTab />,
        },
      },
    ],
  };
  return (
    <div>
      <ViewComponentInternal viewData={viewData} />
      {/* <Tabs defaultValue="listado">
        <TabsList>
          <TabsTrigger value="listado">Tipos de Diagramas</TabsTrigger>
          <TabsTrigger value="diagrams">Tipos de Novedades</TabsTrigger>
          <TabsTrigger value="convenios">CCT</TabsTrigger>
          <TabsTrigger value="contract-types">Tipos de Contrato</TabsTrigger>
          <TabsTrigger value="positions">Puestos</TabsTrigger>
        </TabsList>
        <TabsContent value="listado"> */}
      {/* <ListDiagrams diagramsTypes={diagrams_types} /> */}
      {/* <DiagramTypesTab diagrams_types={diagrams_types} />
        </TabsContent>
        <TabsContent value="diagrams">
          <DiagramTypeComponent diagrams_types={diagrams_types} />
        </TabsContent>
        <TabsContent value="convenios">
          <CovenantTreeFile />
        </TabsContent>
        <TabsContent value="contract-types" className="">
          <ContractTypesTab allContractTypes={allContractTypes} />
        </TabsContent>
        <TabsContent value="positions">
          <PositionsTab />
        </TabsContent>
      </Tabs> */}
    </div>
  );
}
