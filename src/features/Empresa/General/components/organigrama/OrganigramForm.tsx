import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createSector, updateSector } from '../../actions/actions';

interface Sector {
  id: string | null;
  name: string | null;
  is_active: boolean;
}
// interface OrganigramFormValues {
//   id: string | null;
//   name: string | null;
//   is_active: boolean;
// }
const OrganigramSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  is_active: z.boolean(),
});
function organigramForm({ editingSector }: { editingSector: Sector | null }) {
  const form = useForm<z.infer<typeof OrganigramSchema>>({
    resolver: zodResolver(OrganigramSchema),
    defaultValues: {
      name: '',
      is_active: true,
    },
  });
  const { reset } = form;
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!!editingSector);

  console.log(editingSector, 'editingSector');

  useEffect(() => {
    if (editingSector) {
      reset({
        id: editingSector.id ?? '',
        name: editingSector.name ?? '',
        is_active: editingSector.is_active,
      });
      setIsEditing(true);
    } else {
      reset({
        id: '',
        name: '',
        is_active: false,
      });
      setIsEditing(false);
    }
  }, [editingSector, reset]);

  const onSubmit = async (values: z.infer<typeof OrganigramSchema>) => {
    toast.promise(
      async () => {
        await createSector({ name: values.name, is_active: values.is_active });
      },
      {
        loading: 'Creando sector...',
        success: () => {
          router.refresh();
          resetForm();
          return 'Sector creado correctamente';
        },
        error: (error) => {
          return 'Error al crear el sector';
        },
      }
    );
  };

  const onUpdate = async (values: z.infer<typeof OrganigramSchema>) => {
    toast.promise(
      async () => {
        await updateSector({
          id: values.id!,
          name: values.name,
          is_active: values.is_active,
        });
      },
      {
        loading: 'Actualizando sector...',
        success: () => {
          router.refresh();
          resetForm();
          return 'Sector actualizado correctamente';
        },
        error: (error) => {
          return 'Error al actualizar el sector';
        },
      }
    );
  };

  const handleSubmit = (values: z.infer<typeof OrganigramSchema>) => {
    if (isEditing) {
      onUpdate(values);
    } else {
      onSubmit(values);
    }
  };

  const resetForm = () => {
    reset({
      id: '',
      name: '',
      is_active: false,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4">
          <h2 className="text-xl font-bold mb-4">{isEditing ? 'Editar Sector' : 'Crear Sector'}</h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Sector</FormLabel>
                <FormControl>
                  <Input type="text" {...field} className="input w-[400px]" placeholder="Nombre del sector" />
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
          <div className="flex space-x-2">
            <Button type="submit">{isEditing ? 'Actualizar' : 'Crear'}</Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default organigramForm;
