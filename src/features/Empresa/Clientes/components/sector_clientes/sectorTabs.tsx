'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useState } from 'react';
import { fechAllCustomers, fetchAllSectors } from '../../actions/create';
import SectorForm from './sectorForm';
import SectorTable from './sectorTable';

function SectorTabs({
  customers,
  sectors,
}: {
  customers: Awaited<ReturnType<typeof fechAllCustomers>>;
  sectors: Awaited<ReturnType<typeof fetchAllSectors>>;
}) {
  const [SelectedSector, setSelectedSector] = useState<Awaited<ReturnType<typeof fetchAllSectors>>[number] | null>(
    null
  );
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  return (
    <div>
      <ResizablePanelGroup direction="horizontal" className="min-h-[400px]">
        <ResizablePanel defaultSize={40}>
          <SectorForm
            customers={customers}
            sectors={sectors}
            mode={mode}
            setMode={setMode}
            selectedSector={SelectedSector}
            setSelectedSector={setSelectedSector}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <SectorTable
            customers={customers}
            sectors={sectors}
            selectedSector={SelectedSector}
            setSelectedSector={setSelectedSector}
            setMode={setMode}
            mode={mode}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default SectorTabs;
