// 'use client';
import { getNextMonthExpiringDocumentsVehicles } from '@/app/server/GET/actions';
import { formatVehiculesDocuments } from '@/lib/utils';
import { ExpiredDocumentColumsEquipment } from './ExpiredDocumentColumsEquipment';
import { ExpiringDocumentTable } from './data-table-expiring-document';

async function DocumentsTable() {
  // const documentsToShow = useLoggedUserStore((state) => state.documentsToShow);
  // const setShowLastMonthDocuments = useLoggedUserStore((state) => state.setShowLastMonthDocuments);

  const data = await getNextMonthExpiringDocumentsVehicles();
  const formatedData = (data ?? []).map(formatVehiculesDocuments).filter((e) => e.validity !== '');

  return (
    <div className="px-4 pb-4">
      <ExpiringDocumentTable columns={ExpiredDocumentColumsEquipment} data={formatedData} />
    </div>
    // <ExpiredDataTable
    //   data={formatedData || []}
    //   // setShowLastMonthDocuments={setShowLastMonthDocuments}
    //   columns={ExpiredColums}
    //   vehicles={true}
    //   localStorageName="dashboardVehiclesColumns"
    // />
  );
}

export default DocumentsTable;
