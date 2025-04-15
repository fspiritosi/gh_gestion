import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyComponent from '@/features/Empresa/General/components/company/CompanyComponent';
import DangerZoneComponent from '@/features/Empresa/General/components/company/DangerZoneComponent';
import { fetchAllCostCenters, fetchAllSectors, getCompany } from './actions/actions';
import CostCenterTab from './components/cost-center/CostCenterTab';
import OrganigramTab from './components/organigrama/OrganigramTab';

async function General() {
  const costCenters = await fetchAllCostCenters();
  const companyData = await getCompany();
  const sectors = await fetchAllSectors();
  return (
    <div className=" ">
      <Tabs defaultValue="company" className="w-full">
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
      </Tabs>
    </div>
  );
}

export default General;
