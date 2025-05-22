'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getCustomers, getCustomersServices, getServiceItems } from '../actions/actions';

type DailyReportFormProps = {
  // onSubmit: (data: DailyReportFormValues) => void;
  // onCancel: () => void;
  defaultValues?: Partial<DailyReportFormValues>;
  customers: Awaited<ReturnType<typeof getCustomers>>;
  customers_services: Awaited<ReturnType<typeof getCustomersServices>>;
  service_items: Awaited<ReturnType<typeof getServiceItems>>;
};

// Esquema de validación
// Datos mock para empleados y equipos
const mockEmployees = [
  { id: '1', name: 'Juan Pérez' },
  { id: '2', name: 'María García' },
  { id: '3', name: 'Carlos López' },
  { id: '4', name: 'Ana Martínez' },
];

const mockEquipments = [
  { id: '1', name: 'Camión Volvo - ABC123' },
  { id: '2', name: 'Camión Scania - XYZ789' },
  { id: '3', name: 'Retroexcavadora - DEF456' },
  { id: '4', name: 'Minicargadora - GHI789' },
];

export const dailyReportSchema = z
  .object({
    customer: z.string().nonempty('El cliente es obligatorio'),
    services: z.string().nonempty('El servicio es obligatorio'),
    item: z.string().nonempty('El ítem es obligatorio'),
    employees: z.array(z.string()).min(1, 'Debe seleccionar al menos un empleado'),
    equipment: z.array(z.string()).min(1, 'Debe seleccionar al menos un equipo'),
    working_day: z.string().nonempty('La jornada es obligatoria'),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    status: z.string().default('pendiente'),
    description: z.string().optional(),
    document_path: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.working_day === 'por horario') {
        return data.start_time && data.end_time;
      }
      return true;
    },
    {
      message: 'Debe ingresar horario de inicio y fin si la jornada es "por horario"',
      path: ['start_time', 'end_time'],
    }
  );

export type DailyReportFormValues = z.infer<typeof dailyReportSchema>;

export function DailyReportForm({ defaultValues, customers, customers_services, service_items }: DailyReportFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Función para obtener el nombre del cliente por su ID
  const getCustomerNameById = (customerId: string) => {
    return customers?.find((c) => c.id === customerId)?.name || 'Cliente';
  };

  // Función para obtener el nombre del servicio por su ID
  const getServiceNameById = (serviceId: string) => {
    return customers_services?.find((s) => s.id === serviceId)?.service_name || 'Servicio';
  };

  // Función para obtener el servicio completo por su ID
  const getServiceById = (serviceId: string) => {
    return customers_services?.find((s) => s.id === serviceId);
  };

  const onSubmit = (data: DailyReportFormValues) => {
    // console.log(data);
  };

  // Filtrar servicios del cliente seleccionado
  const customerServices = customers_services?.filter((service) => service.customer_id === selectedCustomerId) || [];

  // Filtrar servicios de otros clientes
  const otherServices = customers_services?.filter((service) => service.customer_id !== selectedCustomerId) || [];

  // Filtrar ítems del servicio seleccionado
  const serviceItems = service_items?.filter((item) => item.customer_service_id === selectedServiceId) || [];

  // Filtrar ítems de otros servicios
  const otherItems = service_items?.filter((item) => item.customer_service_id !== selectedServiceId) || [];

  // Obtener el nombre del servicio seleccionado
  const selectedServiceName = selectedServiceId
    ? customerServices.find((s) => s.id === selectedServiceId)?.service_name || 'el servicio seleccionado'
    : 'el servicio';

  const onCancel = () => {
    // console.log('Cancelar');
  };
  const form = useForm<DailyReportFormValues>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      customer: '',
      services: '',
      item: '',
      employees: [],
      equipment: [],
      working_day: '',
      start_time: '',
      end_time: '',
      status: 'pendiente',
      description: '',
      document_path: '',
      ...defaultValues,
    },
  });

  const workingDayOptions = [
    { label: 'Jornada 8 horas', value: 'jornada 8 horas' },
    { label: 'Jornada 12 horas', value: 'jornada 12 horas' },
    { label: 'Por horario', value: 'por horario' },
  ];

  return (
    <div className="pr-2 max-w-[300px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Cliente */}
          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Cliente</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                      >
                        {field.value
                          ? customers?.find((customer) => customer.id === field.value)?.name
                          : 'Seleccionar cliente'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="max-w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar cliente..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No se encontraron clientes.</CommandEmpty>

                        {/* Clientes activos */}
                        <CommandGroup heading="Clientes activos">
                          {customers
                            ?.filter((c) => c.is_active)
                            .map((customer) => (
                              <CommandItem
                                value={customer.name}
                                key={customer.id}
                                onSelect={() => {
                                  form.setValue('customer', customer.id);
                                  setSelectedCustomerId(customer.id);
                                  // Limpiar servicio e ítem al cambiar de cliente
                                  form.setValue('services', '');
                                  form.setValue('item', '');
                                  setSelectedServiceId(null);
                                }}
                              >
                                {customer.name}
                                <Check
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    customer.id === field.value ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                        </CommandGroup>

                        {/* Clientes inactivos */}
                        {(customers?.filter((c) => !c.is_active)?.length || 0) > 0 && (
                          <CommandGroup heading="Clientes inactivos">
                            {customers
                              ?.filter((c) => !c.is_active)
                              .map((customer) => (
                                <CommandItem
                                  value={customer.name}
                                  key={customer.id}
                                  disabled
                                  className="opacity-60"
                                  onSelect={() => {}}
                                >
                                  {customer.name}
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      customer.id === field.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Servicio */}
          <FormField
            control={form.control}
            name="services"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Servicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                      >
                        {field.value
                          ? customerServices.find((service) => service.id === field.value)?.service_name
                          : 'Seleccionar servicio'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="max-w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar servicio..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>
                          {selectedCustomerId
                            ? 'No se encontraron servicios para este cliente.'
                            : 'Seleccione un cliente primero.'}
                        </CommandEmpty>

                        {selectedCustomerId && (
                          <>
                            {/* Servicios del cliente seleccionado */}
                            <CommandGroup heading="Servicios activos">
                              {customerServices
                                .filter((s) => s.is_active)
                                .map((service) => {
                                  const customerName = getCustomerNameById(service.customer_id || '');
                                  return (
                                    <CommandItem
                                      value={service.service_name || ''}
                                      key={service.id}
                                      onSelect={() => {
                                        form.setValue('services', service.id);
                                        setSelectedServiceId(service.id);
                                        form.setValue('item', '');
                                      }}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span>{service.service_name}</span>
                                        <Badge variant="outline" className="ml-2">
                                          {customerName}
                                        </Badge>
                                      </div>
                                      <Check
                                        className={cn(
                                          'ml-2 h-4 w-4',
                                          service.id === field.value ? 'opacity-100' : 'opacity-0'
                                        )}
                                      />
                                    </CommandItem>
                                  );
                                })}
                            </CommandGroup>

                            {/* Servicios inactivos del cliente seleccionado */}
                            {customerServices.filter((s) => !s.is_active).length > 0 && (
                              <CommandGroup heading="Servicios inactivos">
                                {customerServices
                                  .filter((s) => !s.is_active)
                                  .map((service) => {
                                    const customerName = getCustomerNameById(service.customer_id || '');
                                    return (
                                      <CommandItem
                                        value={service.service_name || ''}
                                        key={service.id}
                                        disabled
                                        className="opacity-60"
                                        onSelect={() => {}}
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          <span>{service.service_name}</span>
                                          <Badge variant="outline" className="ml-2">
                                            {customerName}
                                          </Badge>
                                        </div>
                                        <Check className={cn('ml-2 h-4 w-4 opacity-0')} />
                                      </CommandItem>
                                    );
                                  })}
                              </CommandGroup>
                            )}
                          </>
                        )}

                        {/* Servicios de otros clientes */}
                        {otherServices.length > 0 && (
                          <CommandGroup heading="Otros servicios">
                            {otherServices.map((service) => {
                              const customerName = getCustomerNameById(service.customer_id || '');
                              return (
                                <CommandItem
                                  value={service.service_name || ''}
                                  key={service.id}
                                  disabled
                                  className="opacity-60"
                                  onSelect={() => {}}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{service.service_name}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {customerName}
                                    </Badge>
                                  </div>
                                  <Check className={cn('ml-2 h-4 w-4 opacity-0')} />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ítem */}
          <FormField
            control={form.control}
            name="item"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ítem</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                      >
                        {field.value
                          ? service_items?.find((item) => item.item_name === field.value)?.item_name
                          : 'Seleccionar ítem'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="max-w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar ítem..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>
                          {selectedServiceId
                            ? 'No se encontraron ítems para este servicio.'
                            : 'Seleccione un servicio primero.'}
                        </CommandEmpty>

                        {selectedServiceId && (
                          <CommandGroup heading={`Ítems de ${selectedServiceName}`}>
                            {serviceItems.map((item) => {
                              const service = getServiceById(item.customer_service_id || '');

                              return (
                                <CommandItem
                                  value={item.item_name}
                                  key={item.id}
                                  onSelect={() => {
                                    form.setValue('item', item.item_name);
                                  }}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{item.item_name}</span>
                                  </div>
                                  <Check
                                    className={cn(
                                      'ml-2 h-4 w-4',
                                      item.item_name === field.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )}

                        {/* Ítems de otros servicios */}
                        {otherItems.length > 0 && (
                          <CommandGroup heading="Otros ítems">
                            {otherItems.map((item) => {
                              // Obtener el servicio para este ítem
                              const service = customers_services?.find((s) => s.id === item.customer_service_id);
                              // Obtener el nombre del cliente para este servicio
                              const customerName = service ? getServiceNameById(service.id || '') : 'Cliente';

                              return (
                                <CommandItem
                                  value={item.item_name}
                                  key={item.id}
                                  disabled
                                  className="opacity-60"
                                  onSelect={() => {}}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{item.item_name}</span>
                                    <Badge variant="outline" className="">
                                      {item.measure_units?.unit || ''}
                                    </Badge>
                                  </div>
                                  <Check className={cn('ml-2 h-4 w-4 opacity-0')} />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Empleados */}
          <FormField
            control={form.control}
            name="employees"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Empleados</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn('w-full justify-between', !field.value?.length && 'text-muted-foreground')}
                      >
                        {field.value?.length
                          ? `${field.value.length} empleado${field.value.length > 1 ? 's' : ''} seleccionado${field.value.length > 1 ? 's' : ''}`
                          : 'Seleccionar empleados'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar empleados..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron empleados.</CommandEmpty>
                        <CommandGroup>
                          {mockEmployees.map((employee) => (
                            <CommandItem
                              value={employee.name}
                              key={employee.id}
                              onSelect={() => {
                                const currentValues = field.value || [];
                                const newValues = currentValues.includes(employee.id)
                                  ? currentValues.filter((id) => id !== employee.id)
                                  : [...currentValues, employee.id];
                                field.onChange(newValues);
                              }}
                            >
                              <div className="flex items-center">
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value?.includes(employee.id) ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {employee.name}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Equipos */}
          <FormField
            control={form.control}
            name="equipment"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Equipos</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn('w-full justify-between', !field.value?.length && 'text-muted-foreground')}
                      >
                        {field.value?.length
                          ? `${field.value.length} equipo${field.value.length > 1 ? 's' : ''} seleccionado${field.value.length > 1 ? 's' : ''}`
                          : 'Seleccionar equipos'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar equipos..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron equipos.</CommandEmpty>
                        <CommandGroup>
                          {mockEquipments.map((equipment) => (
                            <CommandItem
                              value={equipment.name}
                              key={equipment.id}
                              onSelect={() => {
                                const currentValues = field.value || [];
                                const newValues = currentValues.includes(equipment.id)
                                  ? currentValues.filter((id) => id !== equipment.id)
                                  : [...currentValues, equipment.id];
                                field.onChange(newValues);
                              }}
                            >
                              <div className="flex items-center">
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value?.includes(equipment.id) ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {equipment.name}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Jornada */}
          <FormField
            control={form.control}
            name="working_day"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Jornada</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                      >
                        {field.value
                          ? workingDayOptions.find((day) => day.value === field.value)?.label
                          : 'Seleccionar jornada'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="max-w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar jornada..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No se encontraron jornadas.</CommandEmpty>
                        <CommandGroup>
                          {workingDayOptions.map((day) => (
                            <CommandItem
                              value={day.label}
                              key={day.value}
                              onSelect={() => {
                                form.setValue('working_day', day.value);
                              }}
                            >
                              {day.label}
                              <Check
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  day.value === field.value ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Horario (condicional) */}
          {form.watch('working_day') === 'por horario' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de inicio</FormLabel>
                    <Input type="time" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de fin</FormLabel>
                    <Input type="time" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Descripción */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  placeholder="Ingrese una descripción del trabajo realizado"
                  className="resize-none"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
