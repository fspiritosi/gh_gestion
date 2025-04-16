'use client';
// import { BaseModal } from '@/features/Empresa/RRHH/components/rrhh/baseModal';
// import WorkDiagramForm from '@/features/Empresa/RRHH/components/rrhh/work-diagram-form';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
// import { columns, type Diagram } from './column';
// import { DataTable } from './data-table';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonTable } from './skeletonTable';
interface DiagramType {
  id: string;
  created_at: string;
  name: string;
  company_id: string;
  color: string;
  short_description: string;
  work_active: boolean;
}
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
}: {
  diagramsTypes: DiagramType[];
  onEdit: (diagram: Diagram) => void;
  onModeChange: (mode: 'create' | 'edit') => void;
}) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showActive, setShowActive] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/work-diagrams`);
      const data = await response.json();

      const newData = data.diagrams.map((diagram: Diagram) => {
        const active_novelty = diagramsTypes.find((dt) => dt.id === diagram.active_novelty);
        const inactive_novelty = diagramsTypes.find((dt) => dt.id === diagram.inactive_novelty);
        return {
          ...diagram,
          active_novelty: active_novelty ? active_novelty.name : '',
          inactive_novelty: inactive_novelty ? inactive_novelty.name : '',
        };
      });
      setData(newData);

      if (response.ok) {
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching diagrams:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = showActive
    ? data.filter((d: Diagram) => d.is_active)
    : data.filter((d: Diagram) => !d.is_active);
  console.log(filteredData, 'filteredData');
  return isLoading ? (
    <SkeletonTable />
  ) : (
    <div className="container mx-auto py-4 px-1">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Diagramas de Trabajo</h2>
          <div className="flex justify-end">
            <Button variant="gh_orange" size="sm" onClick={() => setShowActive((prev) => !prev)} className="w-fit">
              {showActive ? 'Ver inactivos' : 'Ver activos'}
            </Button>
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
