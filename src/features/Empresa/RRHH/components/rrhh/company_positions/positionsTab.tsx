'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Toaster } from '@/components/ui/toaster';
import { fetchAllHierarchicalPositions, fetchAllPositions } from '@/features/Empresa/RRHH/actions/actions';
import { Position } from '@/types/types';
import { useEffect, useState } from 'react';
import PositionsForm from './positionsForm';
import PositionsTable from './positionsTable';

function PositionsTab() {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [data, setData] = useState<Position[]>([]);
  const [hierarchicalData, setHierarchicalData] = useState<any[]>([]);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  useEffect(() => {
    const fetchPositions = async () => {
      const positions = await fetchAllPositions();
      setData(positions);
    };
    const fetchHierarchicalPositions = async () => {
      const hierarchicalPositions = await fetchAllHierarchicalPositions();
      setHierarchicalData(hierarchicalPositions);
    };
    fetchPositions();
    fetchHierarchicalPositions();
  }, []);

  return (
    <div>
      <div>
        <ResizablePanelGroup className="min-h-[400px]" direction="horizontal">
          <ResizablePanel defaultSize={40}>
            {/* <WorkDiagramForm diagram={selectedDiagram} mode={mode} diagramsTypes={diagrams_types} setMode={setMode} /> */}
            <PositionsForm
              position={selectedPosition}
              hierarchicalData={hierarchicalData}
              mode={mode}
              setMode={setMode}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            {/* <ListDiagrams diagramsTypes={diagrams_types} onEdit={setSelectedDiagram} onModeChange={setMode} /> */}
            <PositionsTable
              positions={data}
              hierarchicalPositions={hierarchicalData}
              selectedPosition={selectedPosition}
              setSelectedPosition={setSelectedPosition}
              setMode={setMode}
              mode={mode}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
        <Toaster />
      </div>
    </div>
  );
}

export default PositionsTab;
