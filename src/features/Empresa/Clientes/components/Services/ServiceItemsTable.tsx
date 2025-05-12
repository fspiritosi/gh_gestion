'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { useEffect, useState } from 'react';
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
export default function ServiceItemsTable({
  measure_units,
  customers,
  services,
  company_id,
  items,
  editService,
  getItems,
}: {
  measure_units: measure_unit[];
  customers: customer[];
  services: Service[];
  company_id: string;
  items: any[];
  editService: any;
  getItems: () => void;
}) {
  const [editingService, setEditingService] = useState<Item | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');

  const modified_company_id = company_id?.replace(/"/g, '');
  const [nameFilter, setNameFilter] = useState('');

  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  console.log(editService, 'editService');
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

  const filterItems = () => {
    let filtered = items;
    filtered = filtered.filter((item) => item.is_active === isActiveFilter);
    setFilteredItems(filtered as any);
  };
  return (
    <ResizablePanelGroup className=" flex flex-col gap-2" direction="horizontal">
      <ResizablePanel>
        <ServiceItemsForm
          measure_units={measure_units as any}
          customers={customers}
          services={services as any}
          company_id={modified_company_id}
          editingService={editingService as any}
          editService={editService}
          getItems={getItems}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className=" min-w-[500px] flex flex-col gap-2" defaultSize={70}>
        <div className="flex flex-col gap-6 py-4 px-6">
          <div className="flex space-x-4 justify-between">
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
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHead className="bg-header-background">
                    <TableRow>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Nombre
                      </TableCell>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Estado
                      </TableCell>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Descripción
                      </TableCell>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Codigo
                      </TableCell>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Número
                      </TableCell>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        UDM
                      </TableCell>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Precio
                      </TableCell>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Acciones
                      </TableCell>
                    </TableRow>

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
                  </TableHead>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
