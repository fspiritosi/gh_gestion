import CovenantTreeFile from '@/app/dashboard/company/actualCompany/covenant/CovenantTreeFile';
import ListDiagrams from '@/app/dashboard/company/companyComponents/rrhh/listDiagrams';
import DiagramTypeComponent from '@/components/Diagrams/DiagramTypeComponent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
interface DiagramType {
  id: string;
  created_at: string;
  name: string;
  company_id: string;
  color: string;
  short_description: string;
  work_active: boolean;
}
export default async function RrhhComponent() {
  const URL = process.env.NEXT_PUBLIC_BASE_URL;
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const coockiesStore = cookies();
  const company_id = coockiesStore.get('actualComp')?.value;
  // const { employees } = await fetch(`${URL}/api/employees?actual=${company_id}&user=${user?.id}`).then((e) => e.json());

  // const activeEmploees = setEmployeesToShow(employees?.filter((e: any) => e.is_active));

  // const { data: diagrams } = await fetch(`${URL}/api/employees/diagrams`).then((e) => e.json());
  const { data: diagrams_types }: { data: DiagramType[] } = await fetch(
    `${URL}/api/employees/diagrams/tipos?actual=${company_id}&user=${user?.id}`
  ).then((e) => e.json());

  // const employees2 = await fetchAllActivesEmployees();
  // const diagrams2 = await fetchDiagrams();
  // const diagrams_types2 = await fetchDiagramsTypes();
  console.log(diagrams_types);
  return (
    <div>
      <Tabs defaultValue="listado">
        <TabsList>
          <TabsTrigger value="listado">Tipos de Diagramas</TabsTrigger>
          <TabsTrigger value="diagrams">Tipos de Novedades</TabsTrigger>
          <TabsTrigger value="convenios">CCT</TabsTrigger>
        </TabsList>
        <TabsContent value="listado">
          <ListDiagrams diagramsTypes={diagrams_types} />
        </TabsContent>
        <TabsContent value="diagrams">
          <DiagramTypeComponent diagrams_types={diagrams_types} />
        </TabsContent>
        <TabsContent value="convenios">
          <CovenantTreeFile />
        </TabsContent>
      </Tabs>
    </div>
  );
}
