import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyComponent from '@/features/Empresa/General/components/CompanyComponent';
import DangerZoneComponent from '@/features/Empresa/General/components/DangerZoneComponent';
import { fetchAllCostCenters, getCompany } from './actions/actions';
import CostCenterTab from './components/CostCenterTab';

async function General() {
  const costCenters = await fetchAllCostCenters();
  const companyData = await getCompany();

  return (
    <div className=" ">
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="cost-center">Centro de costos</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="">
          <CompanyComponent company={companyData[0]} />
          <DangerZoneComponent />
        </TabsContent>
        <TabsContent value="cost-center" className="">
          <CostCenterTab costCenters={costCenters} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default General;
