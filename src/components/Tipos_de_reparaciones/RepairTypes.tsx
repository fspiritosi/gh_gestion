import { fetchAllEquipmentWithBrand } from '@/app/server/GET/actions';
import { supabaseServer } from '@/lib/supabase/server';
import { setVehiclesToShow } from '@/lib/utils/utils';
import { TypeOfRepair } from '@/types/types';
import { cookies } from 'next/headers';
import InfoComponent from '../InfoComponent';
import ViewcomponentInternal, { ViewDataObj } from '../ViewComponentInternal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import RepairNewEntry from './RepairEntry';
import RepairNewEntryMultiple from './RepairEntryMultiple';
import RepairSolicitudes from './RepairSolicitudesTable/RepairSolicitudes';
import { RepairTypeForm } from './RepairTypeForm';
import { fetchAllTypesOfRepairs } from './actions/actions';

async function RepairTypes({
  type_of_repair_new_entry,
  // type_of_repair_new_entry2,
  // type_of_repair_new_entry3,
  created_solicitudes,
  type_of_repair,
  defaultValue,
  mechanic,
  equipment_id,
  subtab,
  tabValue,
  path,
}: {
  type_of_repair_new_entry?: boolean;
  type_of_repair_new_entry2?: boolean;
  type_of_repair_new_entry3?: boolean;
  created_solicitudes?: boolean;
  type_of_repair?: boolean;
  defaultValue?: string;
  mechanic?: boolean;
  equipment_id?: string;
  subtab?: string;
  tabValue: string;
  path?: string;
}) {
  const URL = process.env.NEXT_PUBLIC_BASE_URL;
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const coockiesStore = cookies();
  const company_id = coockiesStore.get('actualComp')?.value;
  // const { types_of_repairs } = await fetch(`${URL}/api/repairs?actual=${company_id}`).then((res) => res.json());
  const types_of_repairs = await fetchAllTypesOfRepairs();
  // const { equipments } = await fetch(`${URL}/api/equipment?actual=${company_id}&user=${user?.id}`).then((e) =>
  //   e.json()
  // );
  const equipments = await fetchAllEquipmentWithBrand();
  const vehiclesFormatted = equipment_id
    ? setVehiclesToShow(equipments?.filter((e: any) => e.id === equipment_id)) || []
    : setVehiclesToShow(equipments) || [];

  const message =
    'El kilometraje de las unidades seleccionadas no se podran modificar durante la carga multiple, si desea cargar el kilometraje de las unidades seleccionadas, por favor haga la carga individual de cada una de ellas.';

  const viewData: ViewDataObj = {
    defaultValue: subtab || 'created_solicitudes',
    path: path || '/dashboard/equipment',
    tabsValues: [
      {
        value: 'created_solicitudes',
        name: mechanic ? 'Solicitudes activas' : 'Solicitudes de mantenimiento',
        restricted: [''],
        tab: tabValue,
        content: {
          title: mechanic ? 'Solicitudes activas' : 'Solicitudes de mantenimiento',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          component: <RepairSolicitudes mechanic={mechanic} default_equipment_id={equipment_id} />,
        },
      },
      {
        value: 'type_of_repair',
        name: 'Tipos de reparaciones creados',
        restricted: [''],
        tab: tabValue,
        content: {
          buttonActioRestricted: [''],
          title: 'Tipos de reparaciones creados',
          //description: 'Información de la empresa',
          component: <RepairTypeForm types_of_repairs={types_of_repairs} />,
        },
      },
      {
        value: 'type_of_repair_new_entry',
        name: 'Solicitud de mantenimiento',
        restricted: [''],
        tab: tabValue,
        content: {
          buttonActioRestricted: [''],
          title: 'Solicitud de mantenimiento',
          //description: 'Información de la empresa',
          component: (
            <Tabs defaultValue="carga_simple" className="">
              <TabsList>
                <TabsTrigger value="carga_simple">Carga individual</TabsTrigger>
                <TabsTrigger value="carga_multiple">Carga multiple</TabsTrigger>
              </TabsList>
              <TabsContent value="carga_simple">
                {' '}
                <RepairNewEntry
                  user_id={user?.id}
                  equipment={vehiclesFormatted}
                  tipo_de_mantenimiento={types_of_repairs as TypeOfRepair}
                  default_equipment_id={equipment_id}
                />
              </TabsContent>
              <TabsContent value="carga_multiple">
                {' '}
                <InfoComponent size="lg" message={message} />
                <RepairNewEntryMultiple
                  user_id={user?.id}
                  equipment={vehiclesFormatted}
                  tipo_de_mantenimiento={types_of_repairs as TypeOfRepair}
                  default_equipment_id={equipment_id}
                />
              </TabsContent>
            </Tabs>
          ),
        },
      },
    ],
  };

  return (
    <ViewcomponentInternal viewData={viewData} />
    // <Tabs defaultValue={defaultValue || 'created_solicitudes'}>
    //   <TabsList>
    //     {created_solicitudes && (
    //       <TabsTrigger value="created_solicitudes">
    //         {mechanic ? 'Solicitudes activas' : 'Solicitudes de mantenimiento'}
    //       </TabsTrigger>
    //     )}
    //     {type_of_repair_new_entry && (
    //       <TabsTrigger value="type_of_repair_new_entry">Solicitud de mantenimiento</TabsTrigger>
    //     )}

    //     {type_of_repair && <TabsTrigger value="type_of_repair">Tipos de reparaciones creados</TabsTrigger>}
    //   </TabsList>
    //   <TabsContent value="type_of_repair">
    //     <RepairTypeForm types_of_repairs={types_of_repairs} />
    //   </TabsContent>
    //   <TabsContent value="type_of_repair_new_entry">
    //     <Tabs defaultValue="carga_simple" className="">
    //       <TabsList>
    //         <TabsTrigger value="carga_simple">Carga individual</TabsTrigger>
    //         <TabsTrigger value="carga_multiple">Carga multiple</TabsTrigger>
    //       </TabsList>
    //       <TabsContent value="carga_simple">
    //         {' '}
    //         <RepairNewEntry
    //           user_id={user?.id}
    //           equipment={vehiclesFormatted}
    //           tipo_de_mantenimiento={types_of_repairs as TypeOfRepair}
    //           default_equipment_id={equipment_id}
    //         />
    //       </TabsContent>
    //       <TabsContent value="carga_multiple">
    //         {' '}
    //         <InfoComponent size='lg' message={message} />
    //         <RepairNewEntryMultiple
    //           user_id={user?.id}
    //           equipment={vehiclesFormatted}
    //           tipo_de_mantenimiento={types_of_repairs as TypeOfRepair}
    //           default_equipment_id={equipment_id}
    //         />
    //       </TabsContent>
    //     </Tabs>
    //   </TabsContent>
    //   <TabsContent value="type_of_repair_new_entry2">
    //     <RepairNewEntry
    //       tipo_de_mantenimiento={(types_of_repairs as TypeOfRepair).filter(
    //         (e) => e.type_of_maintenance === 'Preventivo'
    //       )}
    //       equipment={vehiclesFormatted}
    //       limittedEquipment
    //       user_id={user?.id}
    //     />
    //   </TabsContent>
    //   <TabsContent value="type_of_repair_new_entry3">
    //     <RepairNewEntry
    //       user_id={user?.id}
    //       tipo_de_mantenimiento={(types_of_repairs as TypeOfRepair).filter(
    //         (e) => e.type_of_maintenance === 'Correctivo'
    //       )}
    //       equipment={vehiclesFormatted}
    //     />
    //   </TabsContent>
    //   <TabsContent value="created_solicitudes">
    //     <RepairSolicitudes mechanic={mechanic} default_equipment_id={equipment_id} />
    //   </TabsContent>
    // </Tabs>
  );
}

export default RepairTypes;
