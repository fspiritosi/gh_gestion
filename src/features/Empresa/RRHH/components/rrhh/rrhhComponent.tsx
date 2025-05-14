import CovenantTreeFile from '@/app/dashboard/company/actualCompany/covenant/CovenantTreeFile';
import { fetchDiagramsTypes } from '@/app/server/GET/actions';
import DiagramTypeComponent from '@/components/Diagrams/DiagramTypeComponent';
import ViewComponentInternal from '@/components/ViewComponentInternal';
import {
  fetchAllContractTypes,
  fetchAllHierarchicalPositions,
  fetchAllPositions,
} from '@/features/Empresa/RRHH/actions/actions';
import ContractTypesTab from '@/features/Empresa/RRHH/components/ContractTypeTab';
import DiagramTypesTab from '@/features/Empresa/RRHH/components/rrhh/diagramTypesTab';
import { cookies } from 'next/headers';
import PositionsTab from '../rrhh/company_positions/positionsTab';
import { fetchAllWorkDiagrams } from './actions/actions';

export default async function RrhhComponent({ tabValue, subtab }: { subtab?: string; tabValue: string }) {
  const cookiesStore = cookies();
  const diagrams_types = await fetchDiagramsTypes();
  const allContractTypes = await fetchAllContractTypes();
  const diagrams = await fetchAllWorkDiagrams();
  const positions = await fetchAllPositions();
  const hierarchicalPositions = await fetchAllHierarchicalPositions();
  const savedVisibilityDiagramTypes = cookiesStore.get('diagram-table-empresa')?.value;
  const tipesNovelties = cookiesStore.get('novelty-types-table-empresa')?.value;
  const savedVisibilityContractTypes = cookiesStore.get('contract-type-table')?.value;
  const savedVisibilityPositions = cookiesStore.get('positions-table')?.value;
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
          buttonActioRestricted: [''],
          buttonAction: '',
          component: (
            <DiagramTypesTab
              data={diagrams}
              diagrams_types={diagrams_types}
              savedVisibility={savedVisibilityDiagramTypes ? JSON.parse(savedVisibilityDiagramTypes) : {}}
            />
          ),
        },
      },
      {
        value: 'diagrams',
        name: 'Tipos de Novedades',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Tipos de Novedades',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: (
            <DiagramTypeComponent
              diagrams_types={diagrams_types}
              savedVisibility={tipesNovelties ? JSON.parse(tipesNovelties) : {}}
            />
          ),
        },
      },
      {
        value: 'convenios',
        name: 'CCT',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'CCT',
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
          buttonActioRestricted: [''],
          buttonAction: '',
          component: (
            <ContractTypesTab
              allContractTypes={allContractTypes}
              savedVisibility={savedVisibilityContractTypes ? JSON.parse(savedVisibilityContractTypes) : {}}
            />
          ),
        },
      },
      {
        value: 'positions',
        name: 'Puestos',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Puestos',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: (
            <PositionsTab
              data={positions}
              savedVisibility={savedVisibilityPositions ? JSON.parse(savedVisibilityPositions) : {}}
              hierarchicalData={hierarchicalPositions}
            />
          ),
        },
      },
    ],
  };
  return (
    <div>
      <ViewComponentInternal viewData={viewData} />
    </div>
  );
}
