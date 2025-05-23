'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchServiceItems } from '@/features/Empresa/Clientes/actions/itemsService';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { useCallback, useEffect, useState } from 'react';
import ServiceItemsForm from './ServiceItemsForm';
interface Item {
  id: string;
  item_name: string;
  item_description: string;
  item_measure_units: { id: string; unit: string };
  item_price: number;
  code_item: string;
  item_number: string;
  is_active: boolean;
  customer_id: { id: string; name: string };
  customer_service_id: { customer_id: { id: string; name: string } };
  company_id: string;
}
interface UpdatedFields {
  item_name?: string;
  item_description?: string;
  item_price?: number;
  item_measure_units?: number;
  is_active?: boolean;
}
interface MeasureUnits {
  id: string;
  unit: string;
  simbol: string;
  tipo: string;
}

interface customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  customer_id: { id: string; name: string };
  customer_service_id: { id: string; name: string };
  service_name: string;
  service_description: string;
  service_price: number;
  is_active: boolean;
  company_id: string;
}
interface company_id {
  company_id: string;
}
interface measure_unit {
  id: number;
  unit: string;
  simbol: string;
  tipo: string;
}
interface ServiceItemsTableProps {
  measure_units: measure_unit[];
  customers: customer[];
  services: Service[];
  company_id: string;
  items: any[];
  editService: any;
  customer_service_id?: string;
}
export default function ServiceItemsTable({
  measure_units,
  customers,
  services,
  company_id,
  items,
  editService,
  customer_service_id,
}: ServiceItemsTableProps) {
  const [editingService, setEditingService] = useState<Item | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');

  const modified_company_id = company_id?.replace(/"/g, '');
  const [nameFilter, setNameFilter] = useState('');

  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    filterItems();
  }, [selectedCustomer, isActiveFilter, items]);
  useEffect(() => {
    let filtered = items;

    if (isActiveFilter) {
      filtered = filtered.filter((item) => item.is_active);
    }

    if (nameFilter.trim() !== '') {
      filtered = filtered.filter((item) => item.item_name.toLowerCase().includes(nameFilter.toLowerCase()));
    }

    setFilteredItems(filtered);
  }, [items, isActiveFilter, nameFilter]);

  // Función para cargar los items del servicio
  const loadItems = useCallback(async () => {
    if (!customer_service_id) return;

    setIsLoading(true);
    setError(null);

    try {
      const serviceItems = await fetchServiceItems(customer_service_id);
      if (serviceItems) {
        // Actualizamos los items locales sin afectar los items que vienen por props
        setFilteredItems(serviceItems as any);
      }
    } catch (err) {
      console.error('Error al cargar los items:', err);
      setError('Error al cargar los items del servicio');
    } finally {
      setIsLoading(false);
    }
  }, [customer_service_id]);

  // Cargar items cuando cambia el customer_service_id
  useEffect(() => {
    if (customer_service_id) {
      loadItems();
    } else if (items && items.length > 0) {
      // Si no hay customer_service_id pero hay items en props, los usamos
      setFilteredItems(items);
    }
  }, [customer_service_id, items, loadItems]);

  // Función para manejar la actualización después de guardar
  const handleItemSaved = async () => {
    if (customer_service_id) {
      await loadItems();
    }
  };

  const filterItems = () => {
    let filtered = items;
    filtered = filtered.filter((item) => item.is_active === isActiveFilter);
    setFilteredItems(filtered as any);
  };
  return (
    <ResizablePanelGroup className=" flex flex-col gap-2" direction="horizontal">
      <ResizablePanel>
        <Card>
          <ServiceItemsForm
            measure_units={measure_units as any}
            customers={customers}
            services={services as any}
            company_id={modified_company_id}
            editingService={editingService as any}
            editService={editService}
            onSuccess={handleItemSaved}
          />
        </Card>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className=" min-w-[500px] flex flex-col gap-2" defaultSize={75}>
        <Card>
          <div className="flex flex-col gap-6 py-4">
            <div className="flex space-x-4 justify-between pl-3 mr-2">
              <Input
                placeholder="Filtrar por nombre"
                className="w-[400px]"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />

              <VerActivosButton data={items} filterKey="is_active" onFilteredChange={setFilteredItems} />
            </div>
            <div className="relative h-[calc(100vh-300px)] w-full">
              <div className="absolute inset-0 overflow-x-auto overflow-y-auto">
                <div className="min-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Codigo</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>UDM</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    {filteredItems?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No hay items
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableBody className="bg-background divide-y">
                        {filteredItems?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">
                              {item.item_name}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              <Badge variant={item.is_active ? 'success' : 'default'}>
                                {item.is_active ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {item.item_description}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {item.code_item}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {item.item_number}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {item.item_measure_units?.unit}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              ${item.item_price}
                            </TableCell>
                            <TableCell>
                              <Button
                                size={'sm'}
                                variant={'link'}
                                className="hover:text-blue-400"
                                onClick={() => setEditingService(item)}
                              >
                                Editar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    )}
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
