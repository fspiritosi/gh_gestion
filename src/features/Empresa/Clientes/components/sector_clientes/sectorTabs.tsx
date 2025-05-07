'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useState } from 'react';
import SectorForm from './sectorForm';
import SectorTable from './sectorTable';

function SectorTabs({ customers, sectors }: { customers: any[]; sectors: SectorWithCustomers[] }) {
  const [SelectedSector, setSelectedSector] = useState<SectorWithCustomers | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  // const [sectorsFetched, setSectorsFetched] = useState<Sector[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const fetchSectors = async () => {
  //   const { sectors: Sector } = await fetchAllSectors();
  //   setSectorsFetched(Sector || []);
  //   setIsLoading(false);
  // };

  // useEffect(() => {
  //   fetchSectors();
  // }, []);

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
