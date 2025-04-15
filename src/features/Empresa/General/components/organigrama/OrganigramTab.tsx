'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useState } from 'react';
import OrganigramForm from './OrganigramForm';
import OrganigramTable from './organigramTable';

interface Sector {
  id: string;
  name: string;
  is_active: boolean;
}
function organigramTab({ sectors }: { sectors: Sector[] }) {
  const [sector, setSector] = useState<Sector | null>(null);
  return (
    <div>
      <div className="w-full">
        <ResizablePanelGroup className="min-h-[400px]" direction="horizontal">
          <ResizablePanel defaultSize={40}>
            <OrganigramForm editingSector={sector} />
          </ResizablePanel>
          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60}>
            {/* <CostCenterTable costCenters={costCenters} onEdit={setCostCenter} /> */}
            <OrganigramTable sectors={sectors} onEdit={setSector} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default organigramTab;
