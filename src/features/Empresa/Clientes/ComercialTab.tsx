import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerTab from '@/features/Empresa/Clientes/components/customerTab';
import { DataCustomers } from '@/features/Empresa/Clientes/components/data-customer';
import CustomerEquipmentTab from '@/features/Empresa/Clientes/components/equipos/customerEquipmentTab';
import SectorTabs from '@/features/Empresa/Clientes/components/sector_clientes/sectorTabs';

function ComercialTab({ columns, data, localStorageName }: any) {
  return (
    <div className="px-0">
      <Tabs defaultValue="customers">
        <CardContent className="px-0">
          <TabsList>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="areas">Areas</TabsTrigger>
            <TabsTrigger value="equipment">Equipos</TabsTrigger>
            <TabsTrigger value="sector">Sectores</TabsTrigger>
          </TabsList>
        </CardContent>
        <TabsContent value="customers">
          <DataCustomers columns={columns} data={data || []} localStorageName={localStorageName} />
        </TabsContent>
        <TabsContent value="areas">
          <CustomerTab />
        </TabsContent>
        <TabsContent value="equipment">
          <CustomerEquipmentTab customers={data || []} />
        </TabsContent>
        <TabsContent value="sector">
          <SectorTabs customers={data || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ComercialTab;
