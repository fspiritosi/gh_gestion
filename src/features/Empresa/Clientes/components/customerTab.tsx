'use client';
import { fetchAllProvinces } from '@/app/server/GET/actions';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { fechAllCustomers, fetchAreasWithProvinces } from '@/features/Empresa/Clientes/actions/create';
import { useEffect, useState } from 'react';
import { AreaTableSkeleton } from './area_clientes/AreaTableSkeleton';
import AreaForm from './area_clientes/areaForm';
import AreaTable from './area_clientes/areaTable';

interface AreaTableProp {
  areas: {
    id: string;
    nombre: string;
    descripcion_corta: string;
    cliente: string;
    provincias: string[];
  }[];
  selectedArea: AreaTableProp['areas'][number] | null;
  setSelectedArea: (area: AreaTableProp['areas'][number] | null) => void;
  setMode: (mode: 'create' | 'edit') => void;
  mode: 'create' | 'edit';
}

interface Cliente {
  cuit: number;
  id: string;
  name: string;
}

function CustomerTab() {
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(true);

  // Carga los datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const { customers } = await fechAllCustomers();
        const provinces = await fetchAllProvinces();
        const areas = await fetchAreasWithProvinces();

        setCustomers(customers || []);
        setProvinces(provinces || []);
        setAreas(areas.areasWithProvinces || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    loadData();
  }, []);

  // Lógica para actualizar clientes cuando cambia selectedArea
  useEffect(() => {
    const getCustomers = async () => {
      const { customers } = await fechAllCustomers();
      setCustomers(customers || []);
    };
    getCustomers();
  }, [selectedArea]);

  const formatedAreas = areas.map((area) => ({
    ...area,
    cliente: area.customer_id?.name,
    provincias: area.area_province.map((province: any) => province.provinces.name),
  }));

  return (
    <div>
      <ResizablePanelGroup direction="horizontal" className="min-h-[400px]">
        <ResizablePanel defaultSize={40}>
          <AreaForm
            customers={customers}
            provinces={provinces}
            mode={mode}
            setMode={setMode}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          {!isLoading ? (
            <AreaTable
              areas={formatedAreas}
              selectedArea={selectedArea}
              setSelectedArea={setSelectedArea}
              setMode={setMode}
              mode={mode}
            />
          ) : (
            <AreaTableSkeleton />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
export default CustomerTab;
