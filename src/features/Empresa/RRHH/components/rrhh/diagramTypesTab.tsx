'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Toaster } from '@/components/ui/toaster';
import ListDiagrams from '@/features/Empresa/RRHH/components/rrhh/listDiagrams';
import WorkDiagramForm from '@/features/Empresa/RRHH/components/rrhh/work-diagram-form';
import { useState } from 'react';

function diagramTypesTab({ diagrams_types, data }: { diagrams_types: DiagramType[]; data: WorkflowDiagram[] }) {
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
          <ListDiagrams data={data} diagramsTypes={diagrams_types} onEdit={setSelectedDiagram} onModeChange={setMode} />
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster />
    </div>
  );
}

export default diagramTypesTab;
