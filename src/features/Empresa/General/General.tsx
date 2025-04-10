import CompanyComponent from '@/components/CompanyComponent';
import DangerZoneComponent from '@/components/DangerZoneComponent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAllCostCenters } from './actions/actions';
import CostCenterTab from './components/CostCenterTab';

async function General() {
  const costCenters = await fetchAllCostCenters();

  return (
    <div className=" ">
      <Tabs defaultValue="cost-center" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="cost-center">Centro de costos</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="">
          <CompanyComponent />
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
