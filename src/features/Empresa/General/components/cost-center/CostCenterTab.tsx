'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useState } from 'react';
import CostCenterForm from './CostCenterForm';
import CostCenterTable from './CostCenterTable';
function CostCenterTab({ costCenters }: { costCenters: CostCenter[] }) {
  const [costCenter, setCostCenter] = useState<CostCenter | null>(null);
  return (
    <div className="w-full">
      <ResizablePanelGroup className="min-h-[400px]" direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <CostCenterForm editingCostCenter={costCenter} />
        </ResizablePanel>
        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60}>
          <CostCenterTable costCenters={costCenters} onEdit={setCostCenter} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default CostCenterTab;
