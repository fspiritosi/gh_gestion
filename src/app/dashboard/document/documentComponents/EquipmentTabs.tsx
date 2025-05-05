import { fetchMonthlyDocumentsEquipment, fetchPermanentDocumentsEquipment } from '@/app/server/GET/actions';
import ViewcomponentInternal from '@/components/ViewComponentInternal';
import { formatVehiculesDocuments } from '@/lib/utils';
import { ExpiredColums } from '../../colums';
import { ColumnsMonthly } from '../../columsMonthly';
import { ExpiredDataTable } from '../../data-table';

async function EquipmentTabs({ subtab, tabValue }: { subtab?: string; tabValue: string }) {
  const monthlyDocuments = (await fetchMonthlyDocumentsEquipment()).map(formatVehiculesDocuments);
  const permanentDocuments = (await fetchPermanentDocumentsEquipment()).map(formatVehiculesDocuments);

  const viewData = {
    defaultValue: subtab || 'permanentes',
    path: '/dashboard/equipment',
    tabsValues: [
      {
        value: 'permanentes',
        name: 'Documentos permanentes',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Todos los equipos',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          component: (
            <ExpiredDataTable
              data={permanentDocuments || []}
              columns={ExpiredColums}
              pending={true}
              vehicles
              defaultVisibleColumnsCustom={['resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
              localStorageName={'dashboardVehiculosPermanentes'}
              permanent
            />
          ),
        },
      },
      {
        value: 'mensuales',
        name: 'Documentos mensuales',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Solo vehículos',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          component: (
            <ExpiredDataTable
              data={monthlyDocuments || []}
              columns={ColumnsMonthly}
              pending={true}
              vehicles
              defaultVisibleColumnsCustom={['resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
              localStorageName={'dashboardVehiculosMensuales'}
              monthly
            />
          ),
        },
      },
    ],
  };
  return (
    <ViewcomponentInternal viewData={viewData} />
    // <Tabs defaultValue="permanentes">
    //   <CardContent>
    //     <TabsList>
    //       <TabsTrigger value="permanentes">Documentos permanentes</TabsTrigger>
    //       <TabsTrigger value="mensuales">Documentos mensuales</TabsTrigger>
    //     </TabsList>
    //   </CardContent>
    //   <TabsContent value="permanentes">
    //     <ExpiredDataTable
    //       data={permanentDocuments || []}
    //       columns={ExpiredColums}
    //       pending={true}
    //       vehicles
    //       defaultVisibleColumnsCustom={['resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
    //       localStorageName={'dashboardVehiculosPermanentes'}
    //       permanent
    //     />
    //   </TabsContent>
    //   <TabsContent value="mensuales">
    //     <ExpiredDataTable
    //       data={monthlyDocuments || []}
    //       columns={ColumnsMonthly}
    //       pending={true}
    //       vehicles
    //       defaultVisibleColumnsCustom={['resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
    //       localStorageName={'dashboardVehiculosMensuales'}
    //       monthly
    //     />
    //   </TabsContent>
    // </Tabs>
  );
}

export default EquipmentTabs;
