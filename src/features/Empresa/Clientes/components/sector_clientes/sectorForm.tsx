'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createSector,
  fechAllCustomers,
  fetchAllSectors,
  updateSector,
} from '@/features/Empresa/Clientes/actions/create';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const SectorSchema = z.object({
  name: z.string().nonempty({ message: 'El nombre es requerido' }),
  descripcion_corta: z.string().nonempty({ message: 'La descripción es requerida' }),
  customer_id: z.string().nonempty({ message: 'El cliente es requerido' }),
});

// interface Sector {
//   id: string;
//   name: string;
//   descripcion_corta: string;
//   customer_id: string;
//   sector_customer: Array<{
//     customer_id: {
//       id: string;
interface SectorFormProps {
  customers: Awaited<ReturnType<typeof fechAllCustomers>>;
  sectors: Awaited<ReturnType<typeof fetchAllSectors>>;
  mode: 'create' | 'edit';
  setMode: (mode: 'create' | 'edit') => void;
  selectedSector: Awaited<ReturnType<typeof fetchAllSectors>>[number] | null;
  setSelectedSector: (sector: Awaited<ReturnType<typeof fetchAllSectors>>[number] | null) => void;
}

type SectorFormValues = z.infer<typeof SectorSchema>;

function SectorForm({ customers, sectors, mode, setMode, selectedSector, setSelectedSector }: SectorFormProps) {
  const form = useForm<SectorFormValues>({
    resolver: zodResolver(SectorSchema),
    defaultValues: {
      name: '',
      descripcion_corta: '',
      customer_id: '',
    },
  });

  const { reset } = form;
  const router = useRouter();

  // Cargar datos cuando cambia el modo o el área seleccionada
  useEffect(() => {
    if (mode === 'edit' && selectedSector) {
      console.log(selectedSector, 'selectedSector');
      reset({
        name: selectedSector.name,
        descripcion_corta: selectedSector.descripcion_corta || '',
        customer_id: selectedSector.sector_customer[0].customers?.id,
      });
    } else if (mode === 'create') {
      reset({
        name: '',
        descripcion_corta: '',
        customer_id: '',
      });
    }
  }, [mode, selectedSector, reset]);

  const handleSubmit = async (values: SectorFormValues) => {
    try {
      if (mode === 'edit' && selectedSector) {
        const response = await updateSector({ ...values, id: selectedSector.id });
        if (response?.status === 200) {
          toast.success(response.body || 'Sector actualizado correctamente');
          reset();
          setSelectedSector(null);
          setMode('create');
          router.refresh();
        } else {
          toast.error(response?.body || 'Error al actualizar el sector');
        }
      } else {
        const response = await createSector(values);
        if (response?.status === 200) {
          toast.success(response.body || 'Sector creado correctamente');
          reset();
          router.refresh();
        } else {
          toast.error(response?.body || 'Error al crear el área');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Error inesperado al procesar la solicitud');
    }
  };

  const handleCancel = () => {
    reset();
    if (mode === 'edit') {
      setSelectedSector(null);
      setMode('create');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 w-[300px]">
        <h2 className="text-xl font-bold mb-4">{mode === 'create' ? 'Crear Sector' : 'Editar Sector'}</h2>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Sector</FormLabel>
              <FormControl>
                <Input type="text" {...field} placeholder="Nombre del sector" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion_corta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Corta</FormLabel>
              <FormControl>
                <Input type="text" {...field} placeholder="Descripción breve" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Clientes</SelectLabel>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="province_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provincias</FormLabel>
              <FormControl>
                <MultiSelectCombobox
                  options={provinces.map((province) => ({
                    label: province.name,
                    value: province.id.toString(),
                  }))}
                  emptyMessage="No hay provincias disponibles"
                  selectedValues={field.value.map(String)}
                  onChange={(values) => field.onChange(values.map(Number))}
                  placeholder="Selecciona provincias"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <div className="flex gap-4">
          <Button type="submit" variant="gh_orange">
            {mode === 'create' ? 'Crear' : 'Actualizar'}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default SectorForm;
