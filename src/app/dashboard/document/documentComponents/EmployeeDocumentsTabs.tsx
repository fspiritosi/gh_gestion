import { fetchEmployeeMonthlyDocuments, fetchEmployeePermanentDocuments } from '@/app/server/GET/actions';
import DocumentNav from '@/components/DocumentNav';
import ViewcomponentInternal from '@/components/ViewComponentInternal';
import { formatEmployeeDocuments } from '@/lib/utils';
import { ExpiredColums } from '../../colums';
import { ColumnsMonthly } from '../../columsMonthly';
import { ExpiredDataTable } from '../../data-table';

async function EmployeeDocumentsTabs({ tabValue, subtab }: { tabValue: string; subtab?: string }) {
  const monthlyDocuments = (await fetchEmployeeMonthlyDocuments()).map(formatEmployeeDocuments);
  const permanentDocuments = (await fetchEmployeePermanentDocuments()).map(formatEmployeeDocuments);

  const viewData = {
    defaultValue: subtab || 'permanentes',
    path: '/dashboard/employee',
    tabsValues: [
      {
        value: 'permanentes',
        name: 'Documentos permanentes',
        tab: tabValue,
        restricted: [''],
        content: {
          title: 'Documentos permanentes',
          description: 'Documentos permanentes',
          buttonActioRestricted: [''],
          buttonAction: (
            <div className="flex gap-4 flex-wrap">
              <DocumentNav onlyEmployees />
            </div>
          ),
          component: (
            <ExpiredDataTable
              data={permanentDocuments || []}
              columns={ExpiredColums}
              pending={true}
              defaultVisibleColumnsCustom={['resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
              localStorageName={'dashboardEmployeesPermanentes'}
              permanent
            />
          ),
        },
      },
      {
        value: 'mensuales',
        name: 'Documentos mensuales',
        tab: tabValue,
        restricted: [''],
        content: {
          title: 'Documentos mensuales',
          description: 'Documentos mensuales',
          buttonActioRestricted: [''],
          buttonAction: (
            <div className="flex gap-4 flex-wrap">
              <DocumentNav onlyEmployees />
            </div>
          ),
          component: (
            <ExpiredDataTable
              data={monthlyDocuments || []}
              columns={ColumnsMonthly}
              pending={true}
              defaultVisibleColumnsCustom={['resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
              localStorageName={'dashboardEmployeesMensuales'}
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
    //       defaultVisibleColumnsCustom={['resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
    //       localStorageName={'dashboardEmployeesPermanentes'}
    //       permanent
    //     />
    //   </TabsContent>
    //   <TabsContent value="mensuales">
    //     <ExpiredDataTable
    //       data={monthlyDocuments || []}
    //       columns={ColumnsMonthly}
    //       pending={true}
    //       defaultVisibleColumnsCustom={['resource', 'documentName', 'validity', 'id', 'mandatory', 'state']}
    //       localStorageName={'dashboardEmployeesMensuales'}
    //       monthly
    //     />
    //   </TabsContent>
    // </Tabs>
  );
}

export default EmployeeDocumentsTabs;
