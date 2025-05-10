'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { handleSubmit } from '@/features/Empresa/Clientes/actions/itemsService';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from '../../../../../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';

const ItemsSchema = z.object({
  customer_id: z.string().optional(),
  customer_service_id: z.string().optional(),
  item_name: z.string().min(1, { message: 'Debe ingresar el nombre del servicio' }),
  item_description: z.string().nullable().optional(),
  code_item: z.string().nullable().optional(),
  item_number: z.string().nullable().optional(),
  item_price: z.preprocess((val) => Number(val), z.number().min(0, { message: 'Debe ingresar un precio válido' })),
  item_measure_units: z.string().min(1, { message: 'Debe seleccionar la unidad de medida' }),
  is_active: z.boolean().default(true),
});

const EditItemSchema = z.object({
  customer_id: z.string().optional(),
  customer_service_id: z.string().optional(),
  item_name: z.string().optional(),
  code_item: z.string().nullable().optional(),
  item_number: z.string().nullable().optional(),
  item_description: z.string().nullable().optional(),
  item_price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, { message: 'Debe ingresar un precio válido' }).optional()
  ),
  item_measure_units: z.string().optional(),
  is_active: z.boolean().optional(),
});

interface Item {
  id: string;
  item_name: string;
  item_description: string | null;
  item_measure_units: { id: string };
  item_price: number;
  is_active: boolean;
  code_item: string | null;
  item_number: string | null;
  customer_id: { id: string; name: string };
  customer_service_id: { customer_id: { id: string; name: string } };
  company_id: string;
}

type Customer = {
  id: string;
  name: string;
};

interface MeasureUnit {
  id: number;
  unit: string;
  simbol: string;
  tipo: string;
}

export default function ServiceItemsForm({
  measure_units,
  customers,
  services,
  company_id,
  editingService,
  editService,
  getItems,
}: {
  measure_units: MeasureUnit[];
  customers: Customer[];
  services: any[];
  company_id: string;
  editingService: Item | null;
  editService: any;
  getItems: () => void;
}) {
  const [isEditing, setIsEditing] = useState(!!editingService);
  const URL = process.env.NEXT_PUBLIC_BASE_URL;
  const supabase = supabaseBrowser();

  const form = useForm<z.infer<typeof ItemsSchema>>({
    resolver: zodResolver(isEditing ? EditItemSchema : ItemsSchema),
    defaultValues: {
      item_name: '',
      item_description: '',
      item_price: 0,
      item_measure_units: '',
      code_item: '',
      item_number: '',
      is_active: true,
    },
  });

  const { reset, watch, setValue } = form;
  const router = useRouter();
  const currentStatus = watch('is_active');

  useEffect(() => {
    if (editingService) {
      reset({
        item_name: editingService.item_name || '',
        item_description: editingService.item_description || '',
        item_price: editingService.item_price || 0,
        item_measure_units: editingService.item_measure_units?.id || '',
        code_item: editingService.code_item || '',
        item_number: editingService.item_number || '',
        is_active: editingService.is_active ?? true,
      });
      setIsEditing(true);
    } else {
      reset({
        item_name: '',
        item_description: '',
        item_price: 0,
        item_measure_units: '',
        code_item: '',
        item_number: '',
        is_active: true,
      });
      setIsEditing(false);
    }
  }, [editingService, reset]);

  const onSubmit = async (values: z.infer<typeof ItemsSchema>) => {
    await handleSubmit(values, editingService, editService, company_id, isEditing, getItems, reset);
  };

  const handleCancel = () => {
    reset({
      item_name: '',
      item_description: '',
      item_price: 0,
      item_measure_units: '',
      code_item: '',
      item_number: '',
      is_active: true,
      customer_id: '',
      customer_service_id: '',
    });

    setIsEditing(false);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Campo Nombre */}
          <FormField
            control={form.control}
            name="item_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Item*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Código */}
          <FormField
            control={form.control}
            name="code_item"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Número */}
          <FormField
            control={form.control}
            name="item_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Precio */}
          <FormField
            control={form.control}
            name="item_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio*</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Unidad de Medida */}
          <FormField
            control={form.control}
            name="item_measure_units"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad de Medida*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione unidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {measure_units?.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Descripción */}
          <FormField
            control={form.control}
            name="item_description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => {
              const radioValue = field.value ? 'true' : 'false';
              return (
                <FormItem className="col-span-2 space-y-3">
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={radioValue}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" />
                        <span>Activo</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" />
                        <span>Inactivo</span>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" variant="gh_orange">
            {isEditing ? 'Editar' : 'Crear'}
          </Button>

          <Button type="button" variant="outline" onClick={() => handleCancel()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
