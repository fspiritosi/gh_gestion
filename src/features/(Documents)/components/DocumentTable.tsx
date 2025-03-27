// 'use client';

import {
  fetchEmployeeMonthlyDocumentsByEmployeeId,
  fetchEmployeePermanentDocumentsByEmployeeId,
} from '@/app/server/GET/actions';
import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentNav from '@/features/(Employees)/modules/documents/components/DocumentNav';
import { ExpiredDataTable } from '@/features/(Employees)/modules/documents/components/data-table/data-table';
import { ExpiredColums } from '@/features/(Employees)/modules/documents/components/tables/data/colums';
import { ColumnsMonthly } from '@/features/(Employees)/modules/documents/components/tables/data/columsMonthly';
import { formatEmployeeDocuments } from '@/lib/utils';

type Props = { employee_id: string; role: string };

export default async function DocumentTable({ employee_id, role }: Props) {
  // const { allDocumentsToShow } = useLoggedUserStore();
  const monthlyDocuments = (await fetchEmployeeMonthlyDocumentsByEmployeeId(employee_id)).map(formatEmployeeDocuments);
  const permanentDocuments = (await fetchEmployeePermanentDocumentsByEmployeeId(employee_id)).map(
    formatEmployeeDocuments
  );

  console.log(permanentDocuments, monthlyDocuments);
  // console.log(allDocumentsToShow.employees.filter((e) => e.document_number === document));
  return (
    <Tabs defaultValue="permanentes">
      <CardContent className="flex justify-between">
        <TabsList>
          <TabsTrigger value="permanentes">Documentos permanentes</TabsTrigger>
          <TabsTrigger value="mensuales">Documentos mensuales</TabsTrigger>
        </TabsList>
        {role !== 'Invitado' && <DocumentNav id_user={employee_id} onlyEmployees onlyNoMultiresource />}
      </CardContent>
      <TabsContent value="permanentes">
        <ExpiredDataTable
          data={permanentDocuments}
          columns={ExpiredColums}
          pending={true}
          defaultVisibleColumnsCustom={['date', 'resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
          localStorageName={'dashboardEmployeesPermanentes'}
          permanent
        />
      </TabsContent>
      <TabsContent value="mensuales">
        <ExpiredDataTable
          data={monthlyDocuments}
          columns={ColumnsMonthly}
          pending={true}
          defaultVisibleColumnsCustom={['date', 'resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
          localStorageName={'dashboardEmployeesMensuales'}
          monthly
        />
      </TabsContent>
    </Tabs>
  );
}
