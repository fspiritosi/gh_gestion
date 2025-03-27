'use client';
import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpiredDataTable } from '@/features/(Employees)/modules/documents/components/data-table/data-table';
import { ExpiredColums } from '@/features/(Employees)/modules/documents/components/tables/data/colums';
import { ColumnsMonthly } from '@/features/(Employees)/modules/documents/components/tables/data/columsMonthly';
import { useLoggedUserStore } from '@/store/loggedUser';

function page() {
  const { allDocumentsToShow } = useLoggedUserStore();

  return (
    <Tabs defaultValue="permanentes">
      <CardContent>
        <TabsList>
          <TabsTrigger value="permanentes">Documentos permanentes</TabsTrigger>
          <TabsTrigger value="mensuales">Documentos mensuales</TabsTrigger>
        </TabsList>
      </CardContent>
      <TabsContent value="permanentes">
        <ExpiredDataTable
          data={allDocumentsToShow?.vehicles.filter((e) => !e.isItMonthly) || []}
          columns={ExpiredColums}
          vehicles={true}
          pending={true}
          defaultVisibleColumnsCustom={['date', 'resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
          localStorageName={'dashboardVehiculosPermanentes'}
          permanent
        />
      </TabsContent>
      <TabsContent value="mensuales">
        <ExpiredDataTable
          data={allDocumentsToShow?.vehicles.filter((e) => e.isItMonthly) || []}
          columns={ColumnsMonthly}
          vehicles={true}
          pending={true}
          defaultVisibleColumnsCustom={['date', 'resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
          localStorageName={'dashboardVehiculosMensuales'}
          monthly
        />
      </TabsContent>
    </Tabs>
  );
}

export default page;
