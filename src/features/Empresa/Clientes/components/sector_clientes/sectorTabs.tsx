'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { fetchAllSectors } from '@/features/Empresa/Clientes/actions/create';
import { useEffect, useState } from 'react';
import SectorForm from './sectorForm';
import SectorTable from './sectorTable';
interface Sector {
  id: string;
  name: string;
  descripcion_corta: string;
  customer_id: string;
  sector_customer: Array<{
    customer_id: {
      id: string;
      name: string;
    };
  }>;
}
function SectorTabs({ customers }: { customers: any[] }) {
  const [SelectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [sectorsFetched, setSectorsFetched] = useState<Sector[]>([]);

  const fetchSectors = async () => {
    const { sectors: Sector } = await fetchAllSectors();
    setSectorsFetched(Sector || []);
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  return (
    <div>
      <ResizablePanelGroup direction="horizontal" className="min-h-[400px]">
        <ResizablePanel defaultSize={40}>
          <SectorForm
            customers={customers}
            sectors={sectorsFetched}
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
            sectors={sectorsFetched}
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
