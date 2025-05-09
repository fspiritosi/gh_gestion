'use client';
// import { BaseModal } from '@/features/Empresa/RRHH/components/rrhh/baseModal';
// import WorkDiagramForm from '@/features/Empresa/RRHH/components/rrhh/work-diagram-form';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Plus } from 'lucide-react';
import { useState } from 'react';
// import { columns, type Diagram } from './column';
// import { DataTable } from './data-table';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VerActivosButton } from './verActivosButton';
// interface DiagramType {
//   id: string;
//   created_at: string;
//   name: string;
//   company_id: string;
//   color: string;
//   short_description: string;
//   work_active: boolean;
// }
// interface Diagram {
//   id: string;
//   created_at: string;
//   name: string;
//   work_active: boolean;
//   active_novelty: string;
//   inactive_novelty: string;
// }
interface Diagram {
  id: string;
  created_at: string;
  name: string;
  is_active: boolean;
  active_working_days: number;
  inactive_working_days: number;
  active_novelty: string;
  inactive_novelty: string;
}

export default function ListDiagrams({
  diagramsTypes,
  onEdit,
  onModeChange,
  data,
}: {
  diagramsTypes: DiagramType[];
  onEdit: (diagram: Diagram) => void;
  onModeChange: (mode: 'create' | 'edit') => void;
  data: WorkflowDiagram[];
}) {
  // const [showActive, setShowActive] = useState(true);
  const [filteredData, setFilteredData] = useState<Diagram[]>([]);

  console.log(diagramsTypes, 'diagramsTypes');
  // const fetchData = async () => {
  //   try {
  //     const data = await fetchAllWorkDiagrams();

  //     const newData = data.map((diagram) => {
  //       const active_novelty = diagramsTypes.find((dt) => dt.id === diagram.active_novelty);
  //       const inactive_novelty = diagramsTypes.find((dt) => dt.id === diagram.inactive_novelty);
  //       return {
  //         ...diagram,
  //         active_novelty: active_novelty ? active_novelty.name : '',
  //         inactive_novelty: inactive_novelty ? inactive_novelty.name : '',
  //       };
  //     });
  //     setData(newData);

  //     setIsLoading(false);
  //   } catch (error) {
  //     setIsLoading(false);
  //     console.error('Error fetching diagrams:', error);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  // const filteredData = showActive
  //   ? data.filter((d: Diagram) => d.is_active)
  //   : data.filter((d: Diagram) => !d.is_active);
  // console.log(filteredData, 'filteredData');
  return (
    <div className="mx-auto ml-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Diagramas de Trabajo</h2>
          <div className="flex justify-end">
            <VerActivosButton
              data={
                data.map((d) => {
                  const active_novelty = diagramsTypes.find((dt) => dt.id === d.active_novelty);
                  const inactive_novelty = diagramsTypes.find((dt) => dt.id === d.inactive_novelty);
                  return {
                    ...d,
                    active_novelty: active_novelty ? active_novelty.name : '',
                    inactive_novelty: inactive_novelty ? inactive_novelty.name : '',
                  };
                }) as any
              }
              filterKey="is_active"
              onFilteredChange={setFilteredData}
            />
          </div>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Nombre</TableHead>
                <TableHead className="w-[180px]">Días activos</TableHead>
                <TableHead className="w-[180px]">Días inactivos</TableHead>
                <TableHead className="w-[180px]">Estado</TableHead>
                <TableHead className="w-[180px]">Novedad activa</TableHead>
                <TableHead className="w-[180px]">Novedad inactiva</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.length > 0 ? (
                filteredData.map((diagram: Diagram) => (
                  <TableRow key={diagram.id}>
                    <TableCell className="font-medium">{diagram.name}</TableCell>
                    <TableCell>{diagram.active_working_days}</TableCell>
                    <TableCell>{diagram.inactive_working_days}</TableCell>
                    <TableCell>
                      <Badge variant={diagram.is_active === true ? 'success' : 'default'}>
                        {diagram.is_active === true ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{diagram.active_novelty}</TableCell>
                    <TableCell>{diagram.inactive_novelty}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="link"
                        className="hover:text-blue-400"
                        onClick={() => {
                          onEdit(diagram);
                          onModeChange('edit');
                        }}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No hay diagramas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
