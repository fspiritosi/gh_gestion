import CovenantTreeFile from '@/app/dashboard/company/actualCompany/covenant/CovenantTreeFile';
import ListDiagrams from '@/app/dashboard/company/companyComponents/rrhh/listDiagrams';
import EmployesDiagram from '@/components/Diagrams/EmployesDiagram';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RrhhComponent() {
  return (
    <div>
      <Tabs defaultValue="diagrams">
        <TabsList>
          <TabsTrigger value="diagrams">Diagramas</TabsTrigger>
          <TabsTrigger value="convenios">Convenios Colectivos de Trabajo</TabsTrigger>
          <TabsTrigger value="listado">Listado de Diagramas</TabsTrigger>
        </TabsList>
        <TabsContent value="diagrams">
          <EmployesDiagram />
        </TabsContent>
        <TabsContent value="convenios">
          <CovenantTreeFile />
        </TabsContent>
        <TabsContent value="listado">
          <ListDiagrams />
        </TabsContent>
      </Tabs>
    </div>
  );
}
