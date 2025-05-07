'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import ServicesForm from './ServicesForm';

type Service = {
  id: string;
  service_name: string;
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

const ServiceTable = ({ services, customers, company_id, areas, sectors, id, Service }: ServiceTableProps) => {
  const supabase = supabaseBrowser();
  const URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [servicesData, setServicesData] = useState<Service[]>([]);
  // const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(Service || null);

  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState(false);
  const [filteredData, setFilteredData] = useState<Service[]>([]);
  const modified_company_id = company_id?.replace(/"/g, '');
  console.log(id, 'id');
  useEffect(() => {
    if (id) {
      setEditing(true);
    }
  }, [id, servicesData]);

  useEffect(() => {
    filterServices();
  }, [selectedCustomer, servicesData, services]);

  const filterServices = (servicesToFilter = services) => {
    let filtered = servicesToFilter;

    if (selectedCustomer !== 'all') {
      filtered = filtered.filter((service) => service.customer_id.toString() === selectedCustomer);
    }

    setFilteredServices(filtered);
  };

  const fetchServices = async () => {
    try {
      const servicesResponse = await fetch(`${URL}/api/services?actual=${modified_company_id}`);

      if (!servicesResponse.ok) {
        throw new Error('Error al obtener los servicios');
      }
      const responseData = await servicesResponse.json();
      const services = Array.isArray(responseData) ? responseData : responseData.services;
      setServicesData(services);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchServices();
  }, []);
  console.log(areas, 'areas');

  console.log(servicesData, 'servicesData');

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

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
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
                  {filteredData.map((service: Service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Link href={`/dashboard/company/actualCompany/${service.id}/?tab=detail`}>
                          {service.service_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/company/actualCompany/${service.id}/?tab=detail`}>
                          {
                            customers.find(
                              (customer) => customer.id.toString() === (service.customer_id?.toString() as any)
                            )?.name
                          }
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/company/actualCompany/${service.id}/?tab=detail`}>
                          {service.contract_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/company/actualCompany/${service.id}/?tab=detail`}>{service.area}</Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/company/actualCompany/${service.id}/?tab=detail`}>
                          {service.sector}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/company/actualCompany/${service.id}/?tab=detail`}>
                          <Badge variant={service.is_active ? 'success' : 'default'}>
                            {service.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/company/actualCompany/${service.id}/?tab=detail`}>
                          {format(service.service_start?.toString(), 'dd/MM/yyyy')}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/company/actualCompany/${service.id}/?tab=detail`}>
                          {format(service.service_validity, 'dd/MM/yyyy')}
                        </Link>
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
                  ))}
                </TableBody>
              </TableHead>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTable;
