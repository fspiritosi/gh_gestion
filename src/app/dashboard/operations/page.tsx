import Create from '@/components/DailyReport/Create';
import DailyReportDetail from '@/components/DailyReport/DailyReportDetail';
import ViewDailyReports from '@/components/DailyReport/ViewDailysReports';
import Viewcomponent from '@/components/ViewComponent';
function OperationsPage() {
  const viewData = {
    defaultValue: 'dailyReportsTable',
    path: '/dashboard/operations',
    tabsValues: [
      {
        value: 'dailyReportsTable',
        name: 'Partes diarios',
        restricted: [''],
        content: {
          title: 'Ver partes diarios',
          description: 'Aquí encontrarás todos los partes diarios diarios',
          buttonActioRestricted: [''],
          buttonAction: <Create />,
          component: (
            <div className="flex flex-col gap-4">
              <Create />
              <ViewDailyReports />
            </div>
          ),
        },
      },
      {
        value: 'dailyReportsDetailTable',
        name: 'Detalle de Partes diarios',
        restricted: [''],
        content: {
          title: 'Ver detalle de partes diarios',
          description: 'Aquí encontrarás todos los detalles de los partes diarios',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <DailyReportDetail />,
        },
      },
      // {
      //   value: 'dailyReports',
      //   name: 'Crear parte diario',
      //   restricted: [''],
      //   content: {
      //     title: 'Crear parte diario',
      //     description: 'Aquí se crean los partes diarios',
      //     buttonActioRestricted: [''],
      //     buttonAction: (''),
      //     component: <DailyReport />,
      //   },
      // },
    ],
  };

  return (
    <div className="h-full">
      <Viewcomponent viewData={viewData} />
    </div>
  );
}

export default OperationsPage;
