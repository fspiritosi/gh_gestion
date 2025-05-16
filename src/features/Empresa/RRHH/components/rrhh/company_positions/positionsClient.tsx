'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Toaster } from '@/components/ui/toaster';
import { Position } from '@/types/types';
import { useState } from 'react';
import PositionsForm from './positionsForm';
import PositionsTable from './positionsTable';

interface PositionsClientProps {
  positions: Position[];
  hierarchicalPositions: any[];
  aptitudes: any[];
}

export default function PositionsClient({ positions, hierarchicalPositions, aptitudes }: PositionsClientProps) {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  return (
    <div>
      <ResizablePanelGroup className="min-h-[400px]" direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <PositionsForm
            position={selectedPosition}
            hierarchicalData={hierarchicalPositions}
            aptitudes={aptitudes}
            mode={mode}
            setMode={setMode}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <PositionsTable
            positions={positions}
            hierarchicalPositions={hierarchicalPositions}
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
            setMode={setMode}
            mode={mode}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster />
    </div>
  );
}
