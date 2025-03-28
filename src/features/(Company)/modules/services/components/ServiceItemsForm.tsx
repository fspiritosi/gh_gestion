'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
// import { Item } from '@radix-ui/react-dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { fetchServices, handleDeactivateItem, itemOnSubmit, itemOnUpdate } from '../actions/actions.items';
import { EditItemSchema, ItemsSchema } from '../schemas/schemas';
import { Item, customer, measure_unit } from '../types/types';

type Service = z.infer<typeof ItemsSchema>;

export default function ServiceItemsForm({
  measure_units,
  customers,
  services,
  company_id,
  editingService,
}: {
  measure_units: measure_unit[];
  customers: customer[];
  services: Service[];
  company_id: string;
  editingService: Item;
}) {
  const [selectedClient, setSelectedClient] = useState<string | undefined>(editingService?.customer_id?.id);
  const [isEditing, setIsEditing] = useState(!!editingService);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const URL = process.env.NEXT_PUBLIC_BASE_URL;

  const [loading, setLoading] = useState(true);

  const form = useForm<Service>({
    resolver: zodResolver(isEditing ? EditItemSchema : ItemsSchema),
    defaultValues: {
      customer_id: '',
      customer_service_id: '',
      item_name: '',
      item_description: '',
      item_price: 0,
      item_measure_units: '',
    },
  });
  const { reset } = form;
  const router = useRouter();

  useEffect(() => {
    fetchServices(company_id)
      .then((data) => {
        setServicesData(data);
      })
      .catch((error) => {
        console.error('Error al obtener los servicios:', error);
      });
  }, [services]);

  useEffect(() => {
    if (editingService) {
      reset({
        customer_id: editingService.customer_service_id?.customer_id?.name,
        customer_service_id: editingService.customer_service_id?.customer_id?.id,
        item_name: editingService.item_name,
        item_description: editingService.item_description,
        item_price: editingService.item_price,
        item_measure_units: editingService.item_measure_units?.id,
      });
      setIsEditing(true);
    } else {
      reset({
        customer_id: '',
        customer_service_id: '',
        item_name: '',
        item_description: '',
        item_price: 0,
        item_measure_units: '',
      });
      setIsEditing(false);
    }
  }, [editingService, reset]);

  const handleDeactivate = async () => {
    handleDeactivateItem(editingService, setFilteredItems);

    try {
      await handleDeactivateItem(editingService, setFilteredItems);
      toast.success('Item dado de baja correctamente');
      resetForm();
    } catch (error) {
      console.error('Error al dar de baja el item:', error);
      toast.error('Error al dar de baja el item');
    }
    router.refresh();
  };

  const handleSubmit1 = (values: any) => {
    if (isEditing) {
      itemOnUpdate(values, editingService, company_id, resetForm);
    } else {
      itemOnSubmit(values, company_id, resetForm);
    }
  };

  const resetForm = () => {
    reset({
      customer_id: '',
      customer_service_id: '',
      item_name: '',
      item_description: '',
      item_price: 0,
      item_measure_units: '',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit1)} className="space-y-8">
        {!isEditing && (
          <>
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedClient(value);
                    }}
                    value={field.value}
                    defaultValue=""
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
              name="customer_service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicio</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                    <FormControl>
                      <SelectTrigger className="w-[400px]">
                        <SelectValue placeholder="Elegir Servicio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {servicesData
                        ?.filter((service) => service.customer_id === selectedClient)
                        .map((service: any) => (
                          <SelectItem value={service.id} key={service.id}>
                            {service.service_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="item_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Item</FormLabel>
              <FormControl>
                <Input type="text" {...field} className="input w-[400px]" placeholder="Nombre del item" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="item_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion del Item</FormLabel>
              <FormControl>
                <Textarea {...field} className="input w-[400px]" placeholder="Descripcion del item" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="item_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio del Item</FormLabel>
              <FormControl>
                <Input type="number" {...field} className="input w-[400px]" placeholder="Precio del item" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="item_measure_units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidad de Medida</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-[400px]">
                    <SelectValue placeholder="Elegir unidad de medida" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {measure_units?.map((measure: measure_unit) => (
                    <SelectItem value={measure.id.toString()} key={measure.id}>
                      {measure.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-4" type="submit">
          {isEditing ? 'Editar' : 'Cargar'}
        </Button>
        <Button className="mt-4 ml-2" type="button" variant={'destructive'} onClick={handleCancel}>
          Cancelar
        </Button>
        {isEditing && (
          <Button
            className="mt-4 ml-2"
            onClick={handleDeactivate}
            variant={editingService.is_active ? 'destructive' : 'success'}
          >
            {editingService.is_active ? 'Dar de Baja' : 'Dar de Alta'}
          </Button>
        )}
      </form>
    </Form>
  );
}

function setItems(arg0: (prevItems: any) => any) {
  throw new Error('Function not implemented.');
}
