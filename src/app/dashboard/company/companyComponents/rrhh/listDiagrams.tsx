'use client';
import { BaseModal } from '@/app/dashboard/company/companyComponents/rrhh/baseModal';
import WorkDiagramForm from '@/app/dashboard/company/companyComponents/rrhh/work-diagram-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { columns, type Diagram } from './column';
import { DataTable } from './data-table';
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

export default function ListDiagrams({ diagramsTypes }: { diagramsTypes: DiagramType[] }) {
  const [data, setData] = useState<Diagram[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState<Diagram | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching diagrams:', error);
    }
  };

  const handleCreate = () => {
    setSelectedDiagram(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleView = (diagram: Diagram) => {
    setSelectedDiagram(diagram);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (diagram: Diagram) => {
    setSelectedDiagram(diagram);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    toast.success('Diagrama guardado exitosamente');
    fetchData();
    setIsModalOpen(false);
    setSelectedDiagram(null);
  };

  useEffect(() => {
    fetchData();
    // setIsLoading(false);
  }, []);

  const handleToggleStatus = async (diagramId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/work-diagrams?id=${diagramId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Diagrama actualizado exitosamente');
        fetchData();
      }
    } catch (error) {
      toast.error('Error al actualizar el diagrama');
      console.error('Error toggling diagram status:', error);
    }
  };

  return isLoading ? (
    <SkeletonTable />
  ) : (
    <div className="container mx-auto py-4 px-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Diagramas de Trabajo</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Diagrama
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns(handleView, handleEdit, handleToggleStatus)} data={data} />
        </CardContent>
      </Card>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'create'
            ? 'Nuevo Diagrama de Trabajo'
            : modalMode === 'edit'
              ? 'Editar Diagrama'
              : 'Ver Diagrama'
        }
        description={
          modalMode === 'create'
            ? 'Complete los campos para crear un nuevo diagrama'
            : modalMode === 'edit'
              ? 'Modifique los campos que desee editar'
              : 'Detalles del diagrama de trabajo'
        }
        size="lg"
      >
        <WorkDiagramForm
          diagram={selectedDiagram}
          mode={modalMode}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
          diagramsTypes={diagramsTypes}
        />
      </BaseModal>
      <Toaster />
    </div>
  );
}
