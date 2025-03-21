'use client';
import { useEffect, useState } from 'react';
// import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ServiceSubmit,
  ServiceUpdate,
  handleDeactivateService,
} from '@/features/company/modules/services/actions/actions.services';
import { ServiceSchema } from '@/features/company/modules/services/schemas/schemas';
import { Service } from '@/features/company/modules/services/types/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function ServicesForm({
  customers,
  company_id,
  editingService,
}: {
  customers: Service[];
  company_id: string;
  editingService?: Service & { is_active: boolean };
}) {
  const form = useForm<Service>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      customer_id: '',
      service_name: '',
      service_start: new Date(),
      service_validity: new Date(),
    },
  });
  const { reset } = form;
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!!editingService);
  // Remove the filteredServices state variable
  const [filteredServices, setFilteredServices] = useState<Service[] | undefined>(
    editingService ? [editingService] : undefined
  );
  useEffect(() => {
    if (editingService) {
      const serviceStartDate = new Date(editingService.service_start);
      const serviceValidityDate = new Date(editingService.service_validity);

      serviceStartDate.setDate(serviceStartDate.getDate() + 1);
      serviceValidityDate.setDate(serviceValidityDate.getDate() + 1);

      reset({
        id: editingService.id,
        customer_id: editingService.customer_id,
        service_name: editingService.service_name,
        service_start: serviceStartDate,
        service_validity: serviceValidityDate,
      });
      setIsEditing(true);
    } else {
      reset({
        id: '',
        customer_id: '',
        service_name: '',
        service_start: new Date(),
        service_validity: new Date(),
      });
      setIsEditing(false);
    }
  }, [editingService, reset]);
  const modified_editing_service_id = editingService?.id?.toString().replace(/"/g, '') ?? '';

  const handleDeactivate = async () => {
    handleDeactivateService(editingService as any, modified_editing_service_id, setFilteredServices, router);
  };

  const handleSubmit1 = (values: Service) => {
    if (isEditing) {
      ServiceUpdate(values, modified_editing_service_id, resetForm, router);
    } else {
      ServiceSubmit(values, company_id, resetForm, router);
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit1)} className="space-y-8">
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-[400px]">
                    <SelectValue placeholder="Elegir cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer: any) => (
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
          name="service_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Servicio</FormLabel>
              <FormControl>
                <Input type="text" {...field} className="input w-[400px]" placeholder="Nombre del servicio" />
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
                <FormLabel>Inicio del Servicio</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn('w-[240px] pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
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
                <FormLabel>Validez del Servicio</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn('w-[240px] pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
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
        <Button className="mt-4" type="submit">
          {isEditing ? 'Editar' : 'Cargar'}
        </Button>
        <Button className="mt-4 ml-2" type="button" onClick={handleCancel} variant={'destructive'}>
          Cancelar
        </Button>
        {isEditing && (
          <Button
            className="mt-4 ml-2"
            onClick={handleDeactivate}
            variant={editingService?.is_active ? 'destructive' : 'success'}
          >
            {editingService?.is_active ? 'Dar de Baja' : 'Dar de Alta'}
          </Button>
        )}
      </form>
    </Form>
  );
}
