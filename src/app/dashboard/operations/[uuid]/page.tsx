import BackButton from '@/components/BackButton';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import {
  getActiveEmployeesForDailyReport,
  getActiveEquipmentsForDailyReport,
  getCustomers,
  getCustomersServices,
  getDailyReportById,
  getServiceItems,
} from '@/features/Operaciones/PartesDiarios/actions/actions';
import DayliReportDetailTable from '@/features/Operaciones/PartesDiarios/components/DayliReportDetailTable';
import moment from 'moment';
import { cookies } from 'next/headers';

async function page({ params }: { params: { uuid: string } }) {
  const dailyReport = await getDailyReportById(params.uuid);
  const cookiesStore = cookies();
  const savedVisibility = cookiesStore.get('dailyReportTableDetail')?.value;
  const customers = await getCustomers();
  const customers_services = await getCustomersServices();
  const service_items = await getServiceItems();
  const employees = await getActiveEmployeesForDailyReport();
  const equipments = await getActiveEquipmentsForDailyReport();

  return (
    <Card className="p-4 mx-6 mt-4">
      <div className="flex justify-between mb-4">
        <div>
          <CardTitle className="text-xl">Parte diario</CardTitle>
          <CardDescription>Fecha: {moment(dailyReport[0].date).format('DD/MM/YYYY')}</CardDescription>
        </div>
        <BackButton />
      </div>
      <DayliReportDetailTable
        dailyReportId={params.uuid}
        customers={customers}
        dailyReport={dailyReport}
        savedVisibility={savedVisibility ? JSON.parse(savedVisibility) : {}}
        customers_services={customers_services}
        service_items={service_items}
        employees={employees}
        equipments={equipments}
      />
    </Card>
  );
}

export default page;
