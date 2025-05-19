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
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  createDailyReportEmployeeRelations,
  createDailyReportEquipmentRelations,
  createDailyReportRow,
  getActiveEmployeesForDailyReport,
  getActiveEquipmentsForDailyReport,
  getCustomers,
  getCustomersServices,
  getServiceItems,
} from '../actions/actions';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { transformDailyReports } from './DayliReportDetailTable';

type DailyReportFormProps = {
  // onSubmit: (data: DailyReportFormValues) => void;
  // onCancel: () => void;
  defaultValues?: ReturnType<typeof transformDailyReports>[number] | null;
  customers: Awaited<ReturnType<typeof getCustomers>>;
  customers_services: Awaited<ReturnType<typeof getCustomersServices>>;
  service_items: Awaited<ReturnType<typeof getServiceItems>>;
  employees: Awaited<ReturnType<typeof getActiveEmployeesForDailyReport>>;
  equipments: Awaited<ReturnType<typeof getActiveEquipmentsForDailyReport>>;
  dailyReportId: string;
};

export const dailyReportSchema = z
  .object({
    customer: z.string().min(1, 'Debe seleccionar un cliente'),
    services: z.string().min(1, 'Debe seleccionar un servicio'),
    item: z.string().min(1, 'Debe seleccionar un ítem'),
    employees: z.array(z.string()).default([]),
    equipment: z.array(z.string()).default([]),
    working_day: z.string().min(1, 'Debe seleccionar un tipo de jornada'),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    status: z.string().default('pendiente'),
    description: z.string().optional(),
    document_path: z.string().optional(),
  })
  .refine((data) => data.employees.length > 0 || data.equipment.length > 0, {
    message: 'Debe seleccionar al menos un empleado o un equipo',
    path: ['employees'],
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

export function DailyReportForm({
  defaultValues,
  customers,
  customers_services,
  service_items,
  employees,
  equipments,
  dailyReportId,
}: DailyReportFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const router = useRouter();
  console.log(defaultValues);

  // Filtros de clientes
  const activeCustomers = customers?.filter((c) => c.is_active) || [];

  const onSubmit = async (data: DailyReportFormValues) => {
    const rowData = {
      customer_id: data.customer,
      service_id: data.services,
      item_id: data.item,
      working_day: data.working_day,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      description: data.description,
      daily_report_id: dailyReportId,
    };

    toast.promise(
      async () => {
        const createdRow = await createDailyReportRow(rowData);

        // 2. Crear relaciones con empleados si existen
        if (data.employees && data.employees.length > 0) {
          await createDailyReportEmployeeRelations(createdRow.id, data.employees);
        }

        // 3. Crear relaciones con equipos si existen
        if (data.equipment && data.equipment.length > 0) {
          await createDailyReportEquipmentRelations(createdRow.id, data.equipment);
        }
        router.refresh();
        document.getElementById('close-button-daily-report')?.click();
        form.reset();
      },
      {
        loading: 'Creando parte diario...',
        success: 'Parte diario creado exitosamente',
        error: 'Error al crear parte diario',
      }
    );
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
      // ...defaultValues,
    },
  });

  // Filtrar servicios activos del cliente seleccionado
  const customerServices = useMemo(() => {
    if (!selectedCustomerId) return [];
    return (
      customers_services?.filter(
        (service) =>
          service.customer_id === selectedCustomerId &&
          service.is_active &&
          (!service.service_validity || new Date(service.service_validity) >= new Date())
      ) || []
    );
  }, [customers_services, selectedCustomerId]);

  // Filtrar ítems activos del servicio seleccionado
  const serviceItems =
    service_items?.filter((item) => item.customer_service_id === selectedServiceId && item.is_active) || [];

  // Filtrar empleados del cliente seleccionado
  const filteredEmployees = useMemo(() => {
    if (!selectedCustomerId) return [];
    return (
      employees?.filter(
        (employee) =>
          employee.is_active &&
          employee.contractor_employee?.some((ce) => ce.contractor_id === selectedCustomerId) &&
          employee.workflow_diagram // Verificar si tiene diagrama de trabajo
      ) || []
    );
  }, [employees, selectedCustomerId]);

  // Filtrar equipos del cliente seleccionado
  const filteredEquipments = useMemo(() => {
    if (!selectedCustomerId) return [];
    return (
      equipments?.filter((equipment) =>
        equipment.contractor_equipment?.some((ce) => ce.contractor_id === selectedCustomerId)
      ) || []
    );
  }, [equipments, selectedCustomerId]);

  // Manejar cambio de cliente
  const handleCustomerChange = (customerId: string) => {
    form.setValue('customer', customerId);
    setSelectedCustomerId(customerId);
    // Limpiar y deshabilitar servicio e ítem al cambiar de cliente
    form.setValue('services', '');
    form.setValue('item', '');
    setSelectedServiceId(null);
    // Habilitar el select de servicio
    setIsServiceDisabled(false);
  };

  // Efecto para controlar la habilitación del campo de ítem
  useEffect(() => {
    if (selectedServiceId) {
      const hasItems = service_items?.some((item) => item.customer_service_id === selectedServiceId && item.is_active);
      // Si no hay ítems, limpiar el valor
      if (!hasItems) {
        form.setValue('item', '');
      }
    } else {
      form.setValue('item', '');
    }
  }, [selectedServiceId, service_items, form]);

  // Manejar cambio de servicio
  const handleServiceChange = (serviceId: string) => {
    form.setValue('services', serviceId);
    form.setValue('item', '');
    setSelectedServiceId(serviceId);
  };

  const onCancel = () => {
    // console.log('Cancelar');
    document.getElementById('close-button-daily-report')?.click();
    // Limpiar valores del formulario
    form.reset();
    setSelectedCustomerId(null);
    setSelectedServiceId(null);
    setIsServiceDisabled(true);
  };

  // Estado para controlar la habilitación de los campos
  const [isServiceDisabled, setIsServiceDisabled] = useState<boolean>(true);

  // Efecto para habilitar/deshabilitar el select de servicio
  useEffect(() => {
    setIsServiceDisabled(!selectedCustomerId);
  }, [selectedCustomerId]);

  const workingDayOptions = [
    { label: 'Jornada 8 horas', value: 'jornada 8 horas' },
    { label: 'Jornada 12 horas', value: 'jornada 12 horas' },
    { label: 'Por horario', value: 'por horario' },
  ];

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button id="open-button-daily-report" variant="default">
            Agregar
          </Button>
        </SheetTrigger>
        <SheetContent className=" sm:max-w-screen-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Agregar Parte Diario</SheetTitle>
            <SheetDescription>Complete los campos para agregar un nuevo parte diario.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
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
                              <div className="px-3 py-1.5 text-xs text-muted-foreground">
                                Nota: Los clientes dados de baja no se muestran en la lista.
                              </div>

                              {/* Clientes activos */}
                              <CommandGroup heading="Clientes activos">
                                {activeCustomers.map((customer) => (
                                  <CommandItem
                                    value={customer.name}
                                    key={customer.id}
                                    onSelect={() => {
                                      handleCustomerChange(customer.id);
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
                              disabled={isServiceDisabled}
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground',
                                isServiceDisabled && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              {field.value
                                ? customerServices.find((service) => service.id === field.value)?.service_name
                                : selectedCustomerId
                                  ? 'Seleccionar servicio'
                                  : 'Seleccione un cliente primero'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="max-w-[400px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Buscar servicio..."
                              className="h-9"
                              disabled={isServiceDisabled}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {!selectedCustomerId
                                  ? 'Seleccione un cliente primero.'
                                  : customerServices.length === 0
                                    ? 'No hay servicios activos para este cliente.'
                                    : 'No se encontraron servicios que coincidan.'}
                              </CommandEmpty>
                              {selectedCustomerId && (
                                <div className="px-3 py-1.5 text-xs text-muted-foreground">
                                  Nota: Los servicios vencidos o de baja no se muestran en la lista.
                                </div>
                              )}

                              {(() => {
                                if (!selectedCustomerId) return null;

                                if (customerServices.length === 0) {
                                  return (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                      No hay servicios activos para este cliente.
                                    </div>
                                  );
                                }

                                return (
                                  <CommandGroup>
                                    {customerServices.map((service) => {
                                      return (
                                        <CommandItem
                                          value={service.service_name || ''}
                                          key={service.id}
                                          onSelect={() => handleServiceChange(service.id)}
                                        >
                                          <div className="flex items-center justify-between w-full">
                                            <span>{service.service_name}</span>
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
                                );
                              })()}
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
                              disabled={!selectedServiceId}
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground',
                                !selectedServiceId && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              {field.value
                                ? serviceItems.find((item) => item.id === field.value)?.item_name ||
                                  'Ítem no encontrado'
                                : selectedServiceId
                                  ? 'Seleccionar ítem'
                                  : 'Seleccione un servicio primero'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder={!selectedServiceId ? 'Seleccione un servicio primero' : 'Buscar ítem...'}
                              className="h-9"
                              disabled={!selectedServiceId}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {!selectedServiceId
                                  ? 'Seleccione un servicio primero.'
                                  : serviceItems.length === 0
                                    ? 'No hay ítems disponibles para este servicio.'
                                    : 'No se encontraron ítems que coincidan.'}
                              </CommandEmpty>

                              {!selectedServiceId && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  Por favor, seleccione un servicio primero.
                                </div>
                              )}

                              {selectedServiceId &&
                                (() => {
                                  if (!selectedServiceId) return null;

                                  if (serviceItems.length === 0) {
                                    return (
                                      <div className="py-6 text-center text-sm text-muted-foreground">
                                        No hay ítems disponibles para este servicio.
                                      </div>
                                    );
                                  }

                                  return (
                                    <CommandGroup>
                                      {serviceItems.map((item) => {
                                        const isSelected = item.id === field.value;

                                        return (
                                          <CommandItem
                                            value={`${item.id}-${item.item_name}`} // Usamos ID y nombre para búsqueda
                                            key={item.id}
                                            onSelect={() => {
                                              form.setValue('item', item.id);
                                            }}
                                            className={cn('group', isSelected ? '' : '')}
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <span>{item.item_name}</span>
                                              {item.measure_units?.unit && (
                                                <Badge variant="outline" className="ml-2">
                                                  {item.measure_units.unit}
                                                </Badge>
                                              )}
                                            </div>
                                            <Check
                                              className={cn('ml-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                                            />
                                          </CommandItem>
                                        );
                                      })}
                                    </CommandGroup>
                                  );
                                })()}
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
                              disabled={!selectedCustomerId}
                              className={cn(
                                'w-full justify-between',
                                !field.value?.length && 'text-muted-foreground',
                                !selectedCustomerId && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              {field.value?.length
                                ? `${field.value.length} empleado${field.value.length > 1 ? 's' : ''} seleccionado${field.value.length > 1 ? 's' : ''}`
                                : selectedCustomerId
                                  ? 'Seleccionar empleados'
                                  : 'Seleccione un cliente primero'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar empleados..." />
                            <CommandList>
                              <CommandEmpty>
                                {!selectedCustomerId
                                  ? 'Seleccione un cliente primero.'
                                  : filteredEmployees.length === 0
                                    ? 'No hay empleados activos para este cliente.'
                                    : 'No se encontraron empleados que coincidan.'}
                              </CommandEmpty>
                              {selectedCustomerId && (
                                <div className="px-3 py-1.5 text-xs text-muted-foreground">
                                  Nota: Los empleados no afectados y sin diagrama no se muestran en la lista.
                                </div>
                              )}

                              {!selectedCustomerId ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  Por favor, seleccione un cliente primero.
                                </div>
                              ) : filteredEmployees.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  No hay empleados activos para este cliente.
                                </div>
                              ) : (
                                <CommandGroup>
                                  {filteredEmployees.map((employee) => (
                                    <CommandItem
                                      value={employee.id}
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
                                        {employee.firstname + ' ' + employee.lastname}
                                      </div>
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
                              disabled={!selectedCustomerId}
                              className={cn(
                                'w-full justify-between',
                                !field.value?.length && 'text-muted-foreground',
                                !selectedCustomerId && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              {field.value?.length
                                ? `${field.value.length} equipo${field.value.length > 1 ? 's' : ''} seleccionado${field.value.length > 1 ? 's' : ''}`
                                : selectedCustomerId
                                  ? 'Seleccionar equipos'
                                  : 'Seleccione un cliente primero'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar equipos..." />
                            <CommandList>
                              <CommandEmpty>
                                {!selectedCustomerId
                                  ? 'Seleccione un cliente primero.'
                                  : filteredEquipments.length === 0
                                    ? 'No hay equipos activos para este cliente.'
                                    : 'No se encontraron equipos que coincidan.'}
                              </CommandEmpty>
                              {selectedCustomerId && (
                                <div className="px-3 py-1.5 text-xs text-muted-foreground">
                                  Nota: Los equipos no operativos ni afectados al cliente seleccionado no se muestran en
                                  la lista.
                                </div>
                              )}

                              {!selectedCustomerId && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  Por favor, seleccione un cliente primero.
                                </div>
                              )}

                              {selectedCustomerId && filteredEquipments.length === 0 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  No hay equipos activos para este cliente.
                                </div>
                              )}

                              {selectedCustomerId && filteredEquipments.length > 0 && (
                                <CommandGroup>
                                  {filteredEquipments.map((equipment) => (
                                    <CommandItem
                                      value={equipment.intern_number || equipment.domain || ''}
                                      key={equipment.id}
                                      disabled={!selectedCustomerId}
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
                                        {equipment.intern_number || equipment.domain}
                                      </div>
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
                                      const previousValue = form.getValues('working_day');
                                      form.setValue('working_day', day.value);

                                      // Si el valor anterior era 'por horario' o si el nuevo valor no es 'por horario', limpiar las horas
                                      if (previousValue === 'por horario' || day.value !== 'por horario') {
                                        form.setValue('start_time', '');
                                        form.setValue('end_time', '');
                                      }
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
          <SheetFooter>
            <SheetClose asChild>
              <Button className="hidden" id="close-button-daily-report" />
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
