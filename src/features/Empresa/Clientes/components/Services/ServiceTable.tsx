'use client';
import Loading from '@/app/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchServiceItems } from '@/features/Empresa/Clientes/actions/itemsService';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { fetchAreasWithProvinces } from '../../actions/create';
import { fetchServices } from '../../actions/service';
import ServiceItemsTable from './ServiceItemsTable';
import ServicesForm from './ServicesForm';
import ContractDocuments from './contractDocuments';

interface Service {
  id: string;
  service_name: string;
  service_id: string;
  contract_number: string;
  service_areas?: {
    area_id: string;
    areas_cliente: {
      id: string;
      nombre: string;
      descripcion_corta: string;
    };
  }[];
  service_sectors?: {
    sector_id: string;
    sectors: {
      id: string;
      name: string;
    };
  }[];
  sector_id: string | string[];
  customer_id: string;
  description: string;
  service_price: number;
  service_start: string | Date;
  service_validity: string | Date;
  is_active: boolean;
  area?: string[];
  customer: string;
  sector?: string;
  created_at?: string;
  company_id?: string;
}

type Customer = {
  id: string;
  name: string;
};

interface ServiceTableProps {
  services: Awaited<ReturnType<typeof fetchServices>>;
  customers: Customer[];
  areas: Awaited<ReturnType<typeof fetchAreasWithProvinces>>;
  company_id: string;
  sectors: any[];
  id?: string;
  measure_units: any[];
  items: any[];
}

const dateSchema = z
  .object({
    service_start: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Fecha de inicio no válida',
    }),
    service_validity: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Fecha de validez no válida',
    }),
  })
  .refine((data) => new Date(data.service_start) < new Date(data.service_validity), {
    message: 'La fecha de inicio debe ser menor que la fecha de validez del servicio',
    path: ['service_validity'],
  });

const ServiceTable = ({
  services,
  customers,
  company_id,
  areas,
  sectors,
  id,
  measure_units,
  items,
}: ServiceTableProps) => {
  const supabase = supabaseBrowser();
  const URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [servicesData, setServicesData] = useState<ServiceTableProps['services']>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<ServiceTableProps['services'][number] | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [filteredServices, setFilteredServices] = useState<ServiceTableProps['services']>([]);
  const [editing, setEditing] = useState(false);
  const [filteredData, setFilteredData] = useState<ServiceTableProps['services']>(services || []);
  const modified_company_id = company_id?.replace(/"/g, '');
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [measureUnitsList, setMeasureUnitsList] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

  const getItems = async () => {
    if (!editingService?.id) return;
    try {
      const items = await fetchServiceItems(editingService.id);

      setItemsList(items);
    } catch (error) {
      console.error('Error al obtener los items:', error);
    }
  };
  useEffect(() => {
    // if (!editingService?.id) return;

    getItems();
  }, [editingService?.id]);

  const getMeasureUnits = async () => {
    // const { data } = await supabase.from('measure_units').select('*');
    setMeasureUnitsList(measure_units);
    return measure_units;
  };
  useEffect(() => {
    if (id) {
      const service = servicesData?.find((service) => service.id === id);
      setEditingService(service || null);
      setEditing(true);
    } else {
      setEditing(false);
      setEditingService(null);
    }
  }, [id, servicesData]);

  useEffect(() => {
    // getItems();
    getMeasureUnits();
  }, []);
  useEffect(() => {
    filterServices();
  }, [selectedCustomer, servicesData, services]);
  const filterItems = () => {
    let filtered = itemsList;
    if (selectedCustomer !== 'all') {
      filtered = filtered.filter((item) => item.customer_id.toString() === selectedCustomer);
    }
    if (id) {
      filtered = filtered.filter((item) => item.service_id.toString() === id);
    }
    setFilteredItems(filtered);
  };
  useEffect(() => {
    filterItems();
  }, [selectedCustomer, id, itemsList]);
  const filterServices = (servicesToFilter = services) => {
    let filtered = servicesToFilter;

    if (selectedCustomer !== 'all') {
      filtered = filtered.filter((service) => service.customer_id?.toString() === selectedCustomer);
    }

    setFilteredServices(filtered);
  };

  const fetchServices = async () => {
    setServicesData(services);
  };
  useEffect(() => {
    fetchServices();
    setLoading(false);
  }, []);

  const formatedServices = useMemo(() => {
    return filteredServices?.map((service) => ({
      ...service,
      customer: areas.find((area) => area.customers?.id === service.customer_id)?.customers?.name,
      area: areas.find((area) => area.id === service.service_areas?.[0].area_id)?.nombre,
      sector: sectors.find((sector) => sector.id === service.service_sectors?.[0].sector_id)?.name,
    }));
  }, [filteredServices, areas, sectors]);

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setEditingService(null); // Limpiar el servicio en edición
    setOpen(true);
  };

  const handleOpenDetail = (service: ServiceTableProps['services'][number]) => {
    setEditingService(service);
    setOpenDetail(true);
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <>
          {id !== undefined && (
            <div>
              <ServicesForm
                customers={customers as any}
                editingService={editingService as any}
                company_id={company_id}
                areas={areas}
                sectors={sectors}
                id={id}
              />
            </div>
          )}

          {id === undefined && (
            <div>
              <Dialog
                open={open}
                onOpenChange={(isOpen) => {
                  if (!isOpen) {
                    setEditingService(null);
                  }
                  setOpen(isOpen);
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="gh_orange" className="mb-4" onClick={handleOpen}>
                    Crear Contrato
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl space-y-6">
                  <DialogTitle>Crear Contrato</DialogTitle>

                  <ServicesForm
                    customers={customers as any}
                    editingService={editingService as any}
                    company_id={company_id}
                    areas={areas}
                    sectors={sectors}
                    setOpen={setOpen}
                  />
                </DialogContent>
              </Dialog>

              {openDetail ? (
                <div>
                  {/* <div className="flex justify-end space-x-4">
                    <Button onClick={() => setOpenDetail(false)}>Cerrar</Button>
                  </div> */}

                  <Tabs defaultValue="detail">
                    <div className="flex justify-between items-center mr-3">
                      <TabsList className="flex gap-1 bg-gh_contrast/50">
                        <TabsTrigger value="detail" className="text-gh_orange font-semibold">
                          Detalle
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="text-gh_orange font-semibold">
                          Documentos
                        </TabsTrigger>
                        <TabsTrigger value="items" className="text-gh_orange font-semibold">
                          Items del Servicio
                        </TabsTrigger>
                      </TabsList>
                      <Button onClick={() => setOpenDetail(false)} className="">
                        Cerrar
                      </Button>
                    </div>
                    <TabsContent value="detail">
                      <ServicesForm
                        editingService={editingService as any}
                        company_id={company_id}
                        areas={areas}
                        sectors={sectors}
                        customers={customers as any}
                        id={editingService?.id}
                      />
                    </TabsContent>
                    <TabsContent value="documents">
                      <ContractDocuments id={editingService?.id as string} />
                    </TabsContent>
                    <TabsContent value="items">
                      <ServiceItemsTable
                        getItems={getItems}
                        editService={(editingService as any) || null}
                        measure_units={measureUnitsList || []}
                        customers={customers || []}
                        services={(services as any) || []}
                        company_id={company_id}
                        items={itemsList || []}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between">
                    <Select
                      onValueChange={(value) => setSelectedCustomer(value)}
                      value={selectedCustomer}
                      defaultValue="all"
                    >
                      <SelectTrigger className="w-[400px]">
                        <SelectValue placeholder="Filtrar por cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los clientes</SelectItem>
                        {customers
                          ?.filter((customer: any) =>
                            formatedServices.some((service) => service.customer_id?.toString() === String(customer.id))
                          )
                          .map((customer: any) => (
                            <SelectItem value={String(customer.id)} key={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <VerActivosButton
                      data={formatedServices as any}
                      filterKey="is_active"
                      onFilteredChange={setFilteredData}
                    />
                  </div>

                  <div className="w-full overflow-x-auto max-h-96 overflow-y-auto mt-4">
                    <Card className="w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Título del Contrato</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Número de Contrato</TableHead>
                            <TableHead>Area</TableHead>
                            <TableHead>Sector</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Inicio del Contrato</TableHead>
                            <TableHead>Validez del Contrato</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredData.length > 0 ? (
                            filteredData.map((service) => (
                              <TableRow
                                key={service.id}
                                onClick={() => handleOpenDetail(service)}
                                className="cursor-pointer hover:bg-gray-50"
                              >
                                <TableCell>{service.service_name}</TableCell>
                                <TableCell>{service.customers?.name}</TableCell>
                                <TableCell>{service.contract_number}</TableCell>
                                <TableCell>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="truncate cursor-pointer">
                                          <Badge>
                                            {service.service_areas?.[0]?.areas_cliente?.nombre || '-'}
                                            {service.service_areas?.length && service.service_areas.length > 1
                                              ? ` +${service.service_areas.length - 1}`
                                              : ''}
                                          </Badge>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="flex flex-col">
                                          {service.service_areas?.map((area) => (
                                            <span key={area.area_id}>{area.areas_cliente?.nombre || '-'}</span>
                                          ))}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="truncate cursor-pointer">
                                          <Badge>
                                            {service.service_sectors && service.service_sectors.length > 0 ? (
                                              <>
                                                {service.service_sectors[0]?.sectors?.name || '-'}
                                                {service.service_sectors.length > 1 &&
                                                  ` +${service.service_sectors.length - 1}`}
                                              </>
                                            ) : (
                                              '-'
                                            )}
                                          </Badge>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="flex flex-col">
                                          {service.service_sectors?.map((sector) => (
                                            <span key={sector.sector_id}>{sector.sectors?.name || '-'}</span>
                                          ))}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                                <TableCell className="">
                                  <Badge variant={service.is_active ? 'success' : 'default'}>
                                    {service.is_active ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="">
                                  {format(service.service_start?.toString() as string, 'dd/MM/yyyy')}
                                </TableCell>
                                <TableCell className="">
                                  {format(service.service_validity as string, 'dd/MM/yyyy')}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center">
                                No hay contratos para mostrar
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceTable;
