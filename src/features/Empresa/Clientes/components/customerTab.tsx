'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { fechAllCustomers } from '@/features/Empresa/Clientes/actions/create';
import { useEffect, useState } from 'react';
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

function CustomerTab({ customers2, provinces, areas }: { customers2: Cliente[]; provinces: any[]; areas: any[] }) {
  const [customers, setCustomers] = useState<Cliente[]>(customers2);
  // const [provinces, setProvinces] = useState<any[]>([]);
  // const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  // Carga los datos al montar el componente
  // useEffect(() => {
  // const loadData = async () => {
  // try {
  // const { customers } = await fechAllCustomers();
  // const provinces = await fetchAllProvinces();
  // const areas = await fetchAreasWithProvinces();

  // setCustomers(customers || []);
  // setProvinces(provinces || []);
  //       // setAreas(areas.areasWithProvinces || []);
  //       setIsLoading(false);
  //     } catch (error) {
  //       console.error('Error cargando datos:', error);
  //     }
  //   };
  //   loadData();
  // }, []);

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
          <AreaTable
            areas={formatedAreas}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            setMode={setMode}
            mode={mode}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
export default CustomerTab;
