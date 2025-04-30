import TypesDocumentAction from '@/app/dashboard/document/documentComponents/TypesDocumentAction';
import DocumentTabComponent from '@/components/DocumentTabComponent';
import ViewcomponentInternal from '@/components/ViewComponentInternal';
import CompanyComponent from '@/features/Empresa/General/components/company/CompanyComponent';
import { fetchAllCostCenters, fetchAllSectors, getCompany } from './actions/actions';
import CostCenterTab from './components/cost-center/CostCenterTab';
import OrganigramTab from './components/organigrama/OrganigramTab';

async function General({ tabValue, subtab }: { subtab?: string; tabValue: string }) {
  const costCenters = await fetchAllCostCenters();
  const companyData = await getCompany();
  const sectors = await fetchAllSectors();
  console.log(subtab, 'subtab hijo');
  const viewData = {
    defaultValue: subtab || 'company',
    tabsValues: [
      {
        value: 'company',
        name: 'Empresa',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Empresa',
          //description: 'Información de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <CompanyComponent company={companyData[0]} />,
        },
      },
      {
        value: 'cost-center',
        name: 'Centro de Costos',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Centro de Costos',
          //description: 'Lista de documentos a nombre de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <CostCenterTab costCenters={costCenters} />,
        },
      },
      {
        value: 'organigrama',
        name: 'Organigrama',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Organigrama',
          //description: 'Lista de usuarios de la empresa',
          buttonActioRestricted: [''],
          buttonAction: '',
          component: <OrganigramTab sectors={sectors} />,
        },
      },
      // {
      //   value: 'users',
      //   name: 'Usuarios',
      //   restricted: [''],
      //   tab: tabValue,
      //   //options:[{value:"employees", label:"Empleados"}, {value:"no-employees", label:"Invitados"}],
      //   content: {
      //     title: 'Usuarios',
      //     //description: 'Lista de usuarios de la empresa',
      //     buttonActioRestricted: [''],
      //     buttonAction: '',
      //     //component: <CompanyUserTab />,
      //     component: <UsersTabComponent />,
      //   },
      // },
      {
        value: '"documentacion"',
        name: 'Documentacion',
        restricted: [''],
        tab: tabValue,
        content: {
          title: 'Documentos empresa',
          //description: 'Lista de documentos a nombre de la empresa',
          tab: tabValue,
          buttonActioRestricted: [''],
          buttonAction: (
            <div className="flex gap-4 flex-wrap pl-6">
              <TypesDocumentAction optionChildrenProp="Empresa" />
            </div>
          ),
          component: <DocumentTabComponent />,
        },
      },
    ],
  };

  return (
    <div className=" ">
      <ViewcomponentInternal viewData={viewData} />
      {/* <Tabs defaultValue="company" className="w-full">
        <TabsList className="mb-2 bg-gh_contrast/50">
          <TabsTrigger className="text-gh_orange font-semibold" value="company">
            Empresa
          </TabsTrigger>
          <TabsTrigger className="text-gh_orange font-semibold" value="cost-center">
            Centro de costos
          </TabsTrigger>
          <TabsTrigger className="text-gh_orange font-semibold" value="organigrama">
            Organigrama
          </TabsTrigger>
        </TabsList>
        <TabsContent value="company" className="">
          <CompanyComponent company={companyData[0]} />
          <DangerZoneComponent />
        </TabsContent>
        <TabsContent value="cost-center" className="">
          <CostCenterTab costCenters={costCenters} />
        </TabsContent>
        <TabsContent value="organigrama">
          <OrganigramTab sectors={sectors} />
        </TabsContent>
      </Tabs> */}
    </div>
  );
}

export default General;
