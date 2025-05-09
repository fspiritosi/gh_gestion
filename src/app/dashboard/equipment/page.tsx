import { fetchAllEmployeesWithRelations, fetchAllEquipmentWithRelations } from '@/app/server/GET/actions';
import PageTableSkeleton from '@/components/Skeletons/PageTableSkeleton';
import RepairTypes from '@/components/Tipos_de_reparaciones/RepairTypes';
import Viewcomponent from '@/components/ViewComponent';
import { buttonVariants } from '@/components/ui/button';
import { getRole } from '@/lib/utils/getRole';
import Link from 'next/link';
import { Suspense } from 'react';
import EquipmentTabs from '../document/documentComponents/EquipmentTabs';
import TypesDocumentAction, {
  setEmployeeDataOptions,
  setVehicleDataOptions,
} from '../document/documentComponents/TypesDocumentAction';
import TypesDocumentsView from '../document/documentComponents/TypesDocumentsView';
import EquipmentListTabs from './equipmentComponentes/EquipmentListTabs';
export default async function Equipment({ searchParams }: { searchParams: { tab: string; subtab?: string } }) {
  const EmployeesOptionsData = await setEmployeeDataOptions();
  const VehicleOptionsData = await setVehicleDataOptions();

  const empleadosCargados = await fetchAllEmployeesWithRelations();
  const equiposCargados = await fetchAllEquipmentWithRelations();
  const role = await getRole();
  const viewData = {
    defaultValue: searchParams?.tab || 'equipos',
    path: '/dashboard/equipment',
    tabsValues: [
      {
        value: 'equipos',
        name: 'Equipos',
        restricted: [],
        content: {
          title: 'Equipos totales',
          description: 'Todos los equipos',
          buttonActioRestricted: ['Invitado'],
          buttonAction: (
            <div className="flex gap-4 flex-wrap pl-6">
              <Link
                href="/dashboard/equipment/action?action=new"
                className={[' py-2 rounded', buttonVariants({ variant: 'default' })].join(' ')}
              >
                Agregar nuevo equipo
              </Link>
            </div>
          ),
          component: <EquipmentListTabs tabValue="equipos" subtab={searchParams.subtab} />,
        },
      },
      {
        value: 'Documentos de equipos',
        name: 'Documentos de equipos',
        restricted: ['Invitado'],
        content: {
          title: 'Documentos cargados',
          description: 'Aquí encontrarás todos los documentos de tus equipos',
          buttonActioRestricted: [''],

          component: (
            <EquipmentTabs path="/dashboard/equipment" tabValue="Documentos de equipos" subtab={searchParams.subtab} />
          ),
        },
      },
      {
        value: 'Tipos de documentos',
        name: 'Tipos de documentos',
        restricted: ['Invitado'],
        content: {
          title: 'Tipos de documentos',
          buttonActioRestricted: [''],
          description: 'Tipos de documentos auditables',
          buttonAction: (
            <TypesDocumentAction
              EmployeesOptionsData={EmployeesOptionsData}
              VehicleOptionsData={VehicleOptionsData}
              empleadosCargados={empleadosCargados}
              equiposCargados={equiposCargados}
              role={role}
              optionChildrenProp="Equipos"
            />
          ),
          component: (
            <TypesDocumentsView
              equipos
              employeeMockValues={EmployeesOptionsData}
              vehicleMockValues={VehicleOptionsData}
              employees={empleadosCargados}
              vehicles={equiposCargados}
            />
          ),
        },
      },
      {
        value: 'type_of_repairs',
        name: 'Mantenimiento',
        restricted: ['Invitado'],
        content: {
          title: 'Mantenimiento de unidades',
          description: 'Genera solicitudes de mantenimiento para tus equipos',
          buttonActioRestricted: [''],
          component: (
            <RepairTypes
              type_of_repair_new_entry
              created_solicitudes
              defaultValue="created_solicitudes"
              tabValue="type_of_repairs"
              subtab={searchParams?.subtab}
            />
          ),
        },
      },
      // {
      //   value: 'forms',
      //   name: 'Formularios',
      //   restricted: [],
      //   content: {
      //     title: 'Formularios',
      //     description: 'Formularios de equipos',
      //     buttonActioRestricted: [''],
      //     // buttonAction: <TypesDocumentAction optionChildrenProp="Personas" />,
      //     component: <CreatedForm />,
      //   },
      // },
    ],
  };

  return (
    <Suspense fallback={<PageTableSkeleton />}>
      <Viewcomponent viewData={viewData} />
    </Suspense>
  );
}
