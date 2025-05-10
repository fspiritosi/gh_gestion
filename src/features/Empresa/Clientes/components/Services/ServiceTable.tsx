'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchServiceItems } from '@/features/Empresa/Clientes/actions/itemsService';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import ServiceItemsTable from './ServiceItemsTable';
import ServicesForm from './ServicesForm';
import ContractDocuments from './contractDocuments';
type Service = {
  id: string;
  service_name: string;
  service_id: string;
  contract_number: string;
  area_id: string;
  sector_id: string;
  customer_id: string;
  description: string;
  service_price: number;
  service_start: string;
  service_validity: string;
  is_active: true;
  area: string;
  customer: string;
  sector: string;
};

type Customer = {
  id: string;
  name: string;
};

type ServiceTableProps = {
  services: Service[];
  customers: Customer[];
  areas: any[];
  company_id: string;
  sectors: any[];
  id?: string;
  Service: Service;
  measure_units: any[];
  items: any[];
};

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
  Service,
  measure_units,
  items,
}: ServiceTableProps) => {
  const supabase = supabaseBrowser();
  const URL = process.env.NEXT_PUBLIC_BASE_URL;
  console.log(services, 'services');
  const [servicesData, setServicesData] = useState<Service[]>([]);
  // const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(Service || null);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState(false);
  const [filteredData, setFilteredData] = useState<Service[]>([]);
  const modified_company_id = company_id?.replace(/"/g, '');
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [measureUnitsList, setMeasureUnitsList] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

  console.log(id, 'id');
  console.log(editingService, 'editingService');
  console.log(items, 'items');
  console.log(measure_units, 'measure_units');
  const getItems = async () => {
    if (!editingService?.id) return;
    try {
      const items = await fetchServiceItems(editingService.id);
      console.log(items, 'items');
      setItemsList(items);
    } catch (error) {
      console.error('Error al obtener los items:', error);
    }
  };
  useEffect(() => {
    // if (!editingService?.id) return;

    getItems();
  }, [editingService?.id]);

  console.log(itemsList, 'itemsList');
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
      filtered = filtered.filter((service) => service.customer_id.toString() === selectedCustomer);
    }

    setFilteredServices(filtered);
  };
  console.log(filteredItems, 'filteredItems');
  const fetchServices = async () => {
    setServicesData(services);
  };
  useEffect(() => {
    fetchServices();
  }, []);
  console.log(areas, 'areas');

  console.log(servicesData, 'servicesData');
  console.log(itemsList, 'itemsList');
  console.log(sectors, 'sectors');
  const formatedServices = useMemo(() => {
    return filteredServices?.map((service) => ({
      ...service,
      customer: areas.find((area) => area.customer_id?.id === service.customer_id)?.customer_id?.name,
      area: areas.find((area) => area.id === service.area_id)?.nombre,
      sector: sectors.find((sector) => sector.id === service.sector_id)?.name,
    }));
  }, [filteredServices, areas, sectors]);
  console.log(editingService, 'editingService');
  console.log(formatedServices, 'formatedServices');
  const [open, setOpen] = useState(false);
  const handleOpenDetail = (service: Service) => {
    setEditingService(service);
    setOpenDetail(true);
  };

  return (
    <div>
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="gh_orange" className="mb-4">
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

          <div className="flex space-x-4 items-center justify-between">
            <Select onValueChange={(value) => setSelectedCustomer(value)} value={selectedCustomer} defaultValue="all">
              <SelectTrigger className="w-[400px]">
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {customers
                  ?.filter((customer: any) =>
                    formatedServices.some((service) => service.customer_id.toString() === String(customer.id))
                  )
                  .map((customer: any) => (
                    <SelectItem value={String(customer.id)} key={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <VerActivosButton data={formatedServices} filterKey="is_active" onFilteredChange={setFilteredData} />
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto mt-4">
            <Card>
              <Table className="min-w-full ">
                <TableHead>
                  <TableRow>
                    <TableCell>Título del Contrato</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Número de Contrato</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Inicio del Contrato</TableCell>
                    <TableCell>Validez del Contrato</TableCell>
                    {/* <TableCell>Acciones</TableCell> */}
                  </TableRow>

                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((service: Service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <Button
                              variant="link"
                              size="sm"
                              className="hover:text-blue-400"
                              onClick={() => handleOpenDetail(service)}
                              data-id={service.id}
                            >
                              {service.service_name}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              size="sm"
                              className="hover:text-blue-400"
                              onClick={() => handleOpenDetail(service)}
                              data-id={service.id}
                            >
                              {service.customer}
                            </Button>
                            {/* <Link href={`/dashboard/company/actualCompany/${service.id}/?tab=detail`}>
                            {
                              customers.find(
                                (customer) => customer.id.toString() === (service.customer_id?.toString() as any)
                              )?.name
                            }
                          </Link> */}
                          </TableCell>
                          <TableCell>
                            {/* <Link href={`/dashboard/company/actualCompany/${service.id}/?tab=detail`}>
                            {service.contract_number}
                          </Link> */}
                            <Button
                              variant="link"
                              size="sm"
                              className="hover:text-blue-400"
                              onClick={() => handleOpenDetail(service)}
                              data-id={service.id}
                            >
                              {service.contract_number}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              size="sm"
                              className="hover:text-blue-400"
                              onClick={() => handleOpenDetail(service)}
                              data-id={service.id}
                            >
                              {service.area}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              size="sm"
                              className="hover:text-blue-400"
                              onClick={() => handleOpenDetail(service)}
                              data-id={service.id}
                            >
                              {service.sector}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              size="sm"
                              className="hover:text-blue-400"
                              onClick={() => handleOpenDetail(service)}
                              data-id={service.id}
                            >
                              <Badge variant={service.is_active ? 'success' : 'default'}>
                                {service.is_active ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              size="sm"
                              className="hover:text-blue-400"
                              onClick={() => handleOpenDetail(service)}
                              data-id={service.id}
                            >
                              {format(service.service_start?.toString(), 'dd/MM/yyyy')}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              size="sm"
                              className="hover:text-blue-400"
                              onClick={() => handleOpenDetail(service)}
                              data-id={service.id}
                            >
                              {format(service.service_validity, 'dd/MM/yyyy')}
                            </Button>
                          </TableCell>

                          {/* <TableCell>
                            <div className="flex space-x-2 justify-between">
                            <Button
                              size={'sm'}
                              variant={'link'}
                              className="hover:text-blue-400"
                              onClick={() => setEditingService(service)}
                            >
                              Editar
                            </Button>
                            
                            </div>
                          </TableCell> */}
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
                </TableHead>
              </Table>
            </Card>
          </div>
        </div>
      )}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-7xl space-y-6 overflow-x-auto overflow-y-auto h-[98dvh]">
          <Tabs defaultValue="detail">
            <TabsList className="flex gap-1 justify-start w-fit bg-gh_contrast/50">
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

          {/* <ServicesForm editingService={editingService as any} company_id={company_id} areas={areas} sectors={sectors} customers={customers as any} id={editingService?.id} /> */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceTable;
