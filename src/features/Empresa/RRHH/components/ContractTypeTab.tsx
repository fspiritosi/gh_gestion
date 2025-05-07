'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useState } from 'react';
import ContractTypeForm from './ContractTypeForm';
import ContractTypeTable from './ContractTypeTable';

export default function ContractTypesTab({ allContractTypes }: { allContractTypes: ContractType[] }) {
  const [editingContractType, setEditingContractType] = useState<ContractType | null>(null);

  return (
    <div className="w-full">
      <ResizablePanelGroup className="min-h-[400px]" direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <ContractTypeForm editingContractType={editingContractType} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60}>
          <ContractTypeTable contractTypes={allContractTypes} onEdit={setEditingContractType} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
