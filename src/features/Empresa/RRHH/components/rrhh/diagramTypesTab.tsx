'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Toaster } from '@/components/ui/toaster';
import ListDiagrams from '@/features/Empresa/RRHH/components/rrhh/listDiagrams';
import WorkDiagramForm from '@/features/Empresa/RRHH/components/rrhh/work-diagram-form';
import { useState } from 'react';
interface DiagramType {
  id: string;
  created_at: string;
  name: string;
  company_id: string;
  color: string;
  short_description: string;
  work_active: boolean;
}
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

function diagramTypesTab({ diagrams_types }: { diagrams_types: DiagramType[] }) {
  const [selectedDiagram, setSelectedDiagram] = useState<Diagram | []>([]);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  console.log(diagrams_types, 'diagrams_types');
  console.log(selectedDiagram, 'selectedDiagram');

  return (
    <div>
      <ResizablePanelGroup className="min-h-[400px]" direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <WorkDiagramForm diagram={selectedDiagram} mode={mode} diagramsTypes={diagrams_types} setMode={setMode} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <ListDiagrams diagramsTypes={diagrams_types} onEdit={setSelectedDiagram} onModeChange={setMode} />
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster />
    </div>
  );
}

export default diagramTypesTab;
