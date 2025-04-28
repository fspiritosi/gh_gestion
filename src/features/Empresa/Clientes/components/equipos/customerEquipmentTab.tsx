'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { fetchEquipmentsCustomers } from '@/features/Empresa/Clientes/actions/create';
import { useEffect, useState } from 'react';
import CustomerEquipmentForm from './customerEquipmentForm';
import CustomerEquipmentTable from './customerEquipmentTable';

function customerEquipmentTab({ customers }: { customers: any[] }) {
  const [SelectedEquipment, setSelectedEquipment] = useState<any | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  // const [customers, setCustomers] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);

  const fetchEquipments = async () => {
    const { equipments } = await fetchEquipmentsCustomers();
    setEquipments(equipments || []);
  };

  useEffect(() => {
    fetchEquipments();
  }, []);
  console.log(SelectedEquipment);
  console.log(customers);
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
