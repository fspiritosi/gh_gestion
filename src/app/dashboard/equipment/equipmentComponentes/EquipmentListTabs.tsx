import { fetchAllEquipment } from '@/app/server/GET/actions';
import ViewcomponentInternal from '@/components/ViewComponentInternal';
import { supabaseServer } from '@/lib/supabase/server';
import { getActualRole } from '@/lib/utils';
import { cookies } from 'next/headers';
import { EquipmentColums } from '../columns';
import { EquipmentTable } from '../data-equipment';

async function EquipmentListTabs({
  inactives,
  actives,
  tabValue,
  subtab,
}: {
  inactives?: boolean;
  actives?: boolean;
  tabValue?: string;
  subtab?: string;
}) {
  const equipments = await fetchAllEquipment();
  const cookiesStore = cookies();
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const company_id = cookiesStore.get('actualComp')?.value;
  const role = await getActualRole(company_id as string, user?.id as string);

  const onlyVehicles = equipments?.filter((v) => v.types_of_vehicles.id == '1');
  const onlyNoVehicles = equipments?.filter((v) => v.types_of_vehicles.id == '2');
  // const data = setVehiclesToShow(equipments);

  const viewData = {
    defaultValue: subtab || 'all',
    path: '/dashboard/equipment',
    tabsValues: [
      {
        value: 'all',
        name: 'Todos los equipos',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Todos los equipos',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          component: <EquipmentTable role={role} columns={EquipmentColums || []} data={equipments || []} />,
        },
      },
      {
        value: 'vehicles',
        name: 'Solo vehículos',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Solo vehículos',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          component: <EquipmentTable role={role} columns={EquipmentColums || []} data={onlyVehicles || []} />,
        },
      },
      {
        value: 'others',
        name: 'Otros',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Otros',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          component: <EquipmentTable role={role} columns={EquipmentColums || []} data={onlyNoVehicles || []} />,
        },
      },
    ],
  };

  return (
    <div className=" max-w-full">
      <ViewcomponentInternal viewData={viewData} />
      {/* <Tabs defaultValue="all">
        <CardContent className="pl-0 pb-0">
          <TabsList>
            <TabsTrigger value="all">Todos los equipos</TabsTrigger>
            <TabsTrigger value="vehicles">Solo vehículos</TabsTrigger>
            <TabsTrigger value="others">Otros</TabsTrigger>
          </TabsList>
        </CardContent>
        <TabsContent value="all">
          <EquipmentTable role={role} columns={EquipmentColums || []} data={equipments || []} />
        </TabsContent>
        <TabsContent value="vehicles">
          <EquipmentTable role={role} columns={EquipmentColums || []} data={onlyVehicles || []} />
        </TabsContent>
        <TabsContent value="others">
          <EquipmentTable role={role} columns={EquipmentColums || []} data={onlyNoVehicles || []} />
        </TabsContent>
      </Tabs> */}
    </div>
  );
}

export default EquipmentListTabs;
