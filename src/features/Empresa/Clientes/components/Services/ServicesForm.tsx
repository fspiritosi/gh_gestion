'use client';
import { useEffect, useState } from 'react';
// import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from '../../../../../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';

const ServiceSchema = z
  .object({
    id: z.string().optional(),
    customer_id: z.string().min(1, { message: 'Debe seleccionar un cliente' }),
    area_id: z.string().min(1, { message: 'Debe seleccionar un area' }),
    sector_id: z.string().min(1, { message: 'Debe seleccionar un sector' }),
    service_name: z.string().min(1, { message: 'Debe ingresar el nombre del servicio' }),
    contract_number: z.string().optional(),
    service_start: z.date(),
    service_validity: z.date(),
    is_active: z.boolean(),
  })
  .refine((data) => data.service_validity > data.service_start, {
    message: 'La validez del servicio debe ser mayor que el inicio del servicio',
    path: ['service_validity'],
  });
interface Customer {
  id: string;
  name: string;
}
type Services = {
  id: string;
  service_name: string;
  customer_id: string;
  area_id: string;
  sector_id: string;
  description: string;
  contract_number: string;
  service_price: number;
  service_start: string;
  service_validity: string;
  is_active: true;
};
type Service = z.infer<typeof ServiceSchema>;

export default function ServicesForm({
  customers,
  company_id,
  editingService,
  areas,
  sectors,
  id,
  setOpen,
}: {
  customers: Service[];
  company_id: string;
  editingService?: Service & { is_active: boolean };
  areas: any[];
  sectors: any[];
  id?: string;
  setOpen?: ((open: boolean) => void) | undefined;
}) {
  const form = useForm<Service>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      customer_id: '',
      area_id: '',
      sector_id: '',
      service_name: '',
      contract_number: '',
      service_start: new Date(),
      service_validity: new Date(),
      is_active: true,
    },
  });
  const { reset } = form;
  const router = useRouter();
  const [view, setView] = useState(false);
  const [isEditing, setIsEditing] = useState(!!editingService);
  console.log(editingService, 'editingService');
  console.log(isEditing, 'isEditing');
  const [filteredServices, setFilteredServices] = useState<Service[] | undefined>(
    editingService ? [editingService] : undefined
  );

  const [filteredAreas, setFilteredAreas] = useState<any[]>([]);
  const [filteredSectors, setFilteredSectors] = useState<any[]>([]);
  console.log(filteredAreas, 'filteredAreas');
  console.log(id, 'id');
  const customerId = form.watch('customer_id');
  useEffect(() => {
    if (id) {
      setView(true);
    }
  }, [id]);
  useEffect(() => {
    const filtered = areas?.filter((area: any) => area.customer_id.id === customerId);
    setFilteredAreas(filtered);
  }, [customerId, areas]);

  useEffect(() => {
    const filtered = sectors?.filter((sector: any) =>
      sector.sector_customer.map((id: any) => id.customer_id.id).includes(customerId)
    );
    setFilteredSectors(filtered);
  }, [customerId, sectors]);

  console.log(sectors, 'sectors');
  console.log(filteredSectors, 'filteredSectors');
  useEffect(() => {
    if (editingService) {
      const serviceStartDate = new Date(editingService.service_start);
      const serviceValidityDate = new Date(editingService.service_validity);

      serviceStartDate.setDate(serviceStartDate.getDate() + 1);
      serviceValidityDate.setDate(serviceValidityDate.getDate() + 1);
      // setFilteredAreas(editingService.area_id as any)
      // setFilteredSectors(editingService.sector_id as any)
      reset({
        id: editingService.id,
        customer_id: editingService.customer_id,
        area_id: editingService.area_id,
        sector_id: editingService.sector_id,
        service_name: editingService.service_name,
        contract_number: editingService.contract_number,
        service_start: serviceStartDate,
        service_validity: serviceValidityDate,
        is_active: editingService.is_active,
      });
      setIsEditing(true);
    } else {
      reset({
        id: '',
        customer_id: '',
        area_id: '',
        sector_id: '',
        service_name: '',
        contract_number: '',
        service_start: new Date(),
        service_validity: new Date(),
        is_active: true,
      });
      setIsEditing(false);
    }
  }, [editingService, reset]);
  const modified_editing_service_id = editingService?.id?.toString().replace(/"/g, '') ?? '';
  console.log(modified_editing_service_id, 'modified_editing_service_id');
  console.log(customerId, 'customerId');
  console.log(filteredAreas, 'filteredAreas');
  const onSubmit = async (values: Service) => {
    const modified_company_id = company_id?.replace(/"/g, '');

    const data = JSON.stringify(values);
    console.log(data, 'data');
    try {
      const response = await fetch(`/api/services?actual=${modified_company_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      });
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      const result = await response.json();
      toast.success('Servicio creado correctamente');
      router.refresh();
      resetForm();
    } catch (error) {
      console.error('Error al crear el servicio:', error);
      toast.error('Error al crear el servicio');
    }
  };

  const onUpdate = async (values: Service) => {
    const modified_company_id = company_id?.replace(/"/g, '');
    console.log(values, 'values');
    const data = JSON.stringify(values);
    try {
      type Service = {
        id: string;
        service_name: string;
        customer_id: string;
        area_id: string;
        description: string;
        contract_number: string;
        service_price: number;
        service_start: string;
        service_validity: string;
        is_active: true;
      };
      const response = await fetch(`/api/services/?id=${modified_editing_service_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      });
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      const result = await response.json();
      toast.success('Servicio actualizado correctamente');
      resetForm();
      router.refresh();
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      toast.error('Error al actualizar el servicio');
    }
  };

  const handleSubmit1 = (values: Service) => {
    if (isEditing) {
      onUpdate(values);
    } else {
      onSubmit(values);
    }
  };

  const resetForm = () => {
    reset({
      id: '',
      customer_id: '',
      service_name: '',
      service_start: new Date(),
      service_validity: new Date(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
    setOpen?.(false);
  };

  const formatedAreas = areas?.map((area) => ({
    ...area,
    cliente: area.customer_id?.name,
    provincias: area.area_province.map((province: any) => province.provinces.name),
  }));

  console.log(formatedAreas, 'formatedAreas');
  return (
    <div>
      {view && (
        <div className="flex justify-end space-x-4">
          <Button onClick={() => setView(!view)}>{view ? 'Habilitar Edicion' : 'Ver'}</Button>

          {/* <Link href="/dashboard/company/actualCompany?tab=comerce&subtab=service">
            <Button>Volver</Button>
          </Link> */}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit1)} className="contents">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    disabled={view}
                    onValueChange={field.onChange}
                    value={field.value || editingService?.customer_id}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[400px]">
                        <SelectValue placeholder="Elegir cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers?.map((customer: any) => (
                        <SelectItem value={customer.id} key={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <Select disabled={view} onValueChange={field.onChange} value={field.value || editingService?.area_id}>
                    <FormControl>
                      <SelectTrigger className="w-[400px]">
                        <SelectValue placeholder="Elegir area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredAreas?.map((area: any) => (
                        <SelectItem value={area.id} key={area.id}>
                          {area.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sector_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <Select
                    disabled={view}
                    onValueChange={field.onChange}
                    value={field.value || editingService?.sector_id}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[400px]">
                        <SelectValue placeholder="Elegir sector" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSectors?.map((sector: any) => (
                        <SelectItem value={sector.id} key={sector.id}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="service_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Contrato</FormLabel>
                  <FormControl>
                    <Input
                      disabled={view}
                      type="text"
                      {...field}
                      className="input w-[400px]"
                      placeholder="Título del contrato"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_start"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-4 items-center w-[400px] justify-between">
                    <FormLabel>Inicio del Contrato</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            disabled={view}
                            variant={'outline'}
                            className={cn(
                              'w-[240px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? field.value.toLocaleDateString() : 'Elegir fecha'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            {...field}
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="service_validity"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-4 items-center w-[400px] justify-between">
                    <FormLabel>Validez del Contrato</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            disabled={view}
                            variant={'outline'}
                            className={cn(
                              'w-[240px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? field.value.toLocaleDateString() : 'Elegir fecha'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contract_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Contrato</FormLabel>
                  <FormControl>
                    <Input
                      disabled={view}
                      type="text"
                      {...field}
                      className="input w-[400px]"
                      placeholder="Número de contrato"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Activo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      disabled={view}
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={field.value ? 'true' : 'false'}
                      className="flex  space-x-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel className="font-normal">Activo</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="font-normal">Inactivo</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={view} className="mt-4" type="submit" variant={'gh_orange'}>
              {isEditing ? 'Editar' : 'Crear'}
            </Button>
            <Button disabled={view} className="mt-4 ml-2" type="button" onClick={handleCancel} variant={'outline'}>
              Cancelar
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
