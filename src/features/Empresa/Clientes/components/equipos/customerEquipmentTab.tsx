'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useState } from 'react';
import { fechAllCustomers, fetchEquipmentsCustomers } from '../../actions/create';
import CustomerEquipmentForm from './customerEquipmentForm';
import CustomerEquipmentTable from './customerEquipmentTable';
function customerEquipmentTab({
  customers,
  equipments,
}: {
  customers: Awaited<ReturnType<typeof fechAllCustomers>>;
  equipments: Awaited<ReturnType<typeof fetchEquipmentsCustomers>>;
}) {
  const [SelectedEquipment, setSelectedEquipment] = useState<any | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  return (
    <div>
      <ResizablePanelGroup direction="horizontal" className="min-h-[400px]">
        <ResizablePanel defaultSize={40}>
          <CustomerEquipmentForm
            customers={customers}
            equipments={equipments}
            mode={mode}
            setMode={setMode}
            selectedEquipment={SelectedEquipment}
            setSelectedEquipment={setSelectedEquipment}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <CustomerEquipmentTable
            customers={customers}
            customerEquipments={equipments}
            selectedCustomerEquipment={SelectedEquipment}
            setSelectedCustomerEquipment={setSelectedEquipment}
            setMode={setMode}
            mode={mode}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default customerEquipmentTab;
