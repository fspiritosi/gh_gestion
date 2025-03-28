// 'use client';
import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpiredColums } from '@/features/(Employees)/modules/documents/components/tables/data/colums';
import { ColumnsMonthly } from '@/features/(Employees)/modules/documents/components/tables/data/columsMonthly';
import { ExpiredDataTable } from '@/features/(Employees)/modules/documents/components/data-table/data-table';
// import { useLoggedUserStore } from '@/store/loggedUser';
import { fetchMonthlyDocumentsByEquipmentId, fetchPermanentDocumentsByEquipmentId } from '@/app/server/GET/actions';
import { supabaseServer } from '@/lib/supabase/server';
import { formatVehiculesDocuments } from '@/lib/utils';
import { cookies } from 'next/headers';
import DocumentNav from '@/features/(Employees)/modules/documents/components/DocumentNav';

export default async function DocumentEquipmentComponent({ id, role }: { id: string; role: string }) {
  const monthlyDocuments = (await fetchMonthlyDocumentsByEquipmentId(id)).map(formatVehiculesDocuments);
  const supabase = supabaseServer();
  const permanentDocuments = (await fetchPermanentDocumentsByEquipmentId(id)).map(formatVehiculesDocuments);
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;

  return (
    <Tabs defaultValue="permanentes">
      <CardContent className="flex justify-between">
        <TabsList>
          <TabsTrigger value="permanentes">Documentos permanentes</TabsTrigger>
          <TabsTrigger value="mensuales">Documentos mensuales</TabsTrigger>
        </TabsList>
        {role !== 'Invitado' && <DocumentNav id_user={id} onlyEquipment onlyNoMultiresource />}
      </CardContent>
      <TabsContent value="permanentes">
        <div className="grid ">
          <ExpiredDataTable
            data={permanentDocuments}
            columns={ExpiredColums}
            vehicles={true}
            pending={true}
            defaultVisibleColumnsCustom={['date', 'resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
            localStorageName={'dashboardVehiculosPermanentes'}
            permanent
          />
        </div>
      </TabsContent>
      <TabsContent value="mensuales">
        <div className="grid  ">
          <ExpiredDataTable
            data={monthlyDocuments}
            columns={ColumnsMonthly}
            vehicles={true}
            pending={true}
            defaultVisibleColumnsCustom={['date', 'resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
            localStorageName={'dashboardVehiculosMensuales'}
            monthly
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
