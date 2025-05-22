import BackButton from '@/components/BackButton';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import {
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
        customers={customers}
        dailyReport={dailyReport}
        savedVisibility={savedVisibility ? JSON.parse(savedVisibility) : {}}
        customers_services={customers_services}
        service_items={service_items}
      />
    </Card>
  );
}

export default page;
