'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface DiagramNewTypeFormProps {
  selectedDiagram?: any;
  diagramToEdit: boolean;
  setDiagramToEdit: (value: boolean) => void;
}

export function DiagramNewTypeForm({ selectedDiagram, diagramToEdit, setDiagramToEdit }: DiagramNewTypeFormProps) {
  const company_id = cookies.get('actualComp');
  const URL = process.env.NEXT_PUBLIC_BASE_URL;
  const NewDiagramType = z.object({
    name: z.string().min(1, { message: 'El nombre de la novedad no puede estar vacío' }),
    short_description: z.string().min(1, { message: 'La descripción dorta no puede estar vacía' }),
    color: z.string().min(1, { message: 'Por favor selecciona un color para la novedad' }),
    id: z.string().optional(),
    work_active: z.boolean().optional(),
    is_active: z.boolean().optional(),
  });

  type NewDiagramType = z.infer<typeof NewDiagramType>;
  const router = useRouter();

  const form = useForm<NewDiagramType>({
    resolver: zodResolver(NewDiagramType),
    defaultValues: {
      name: '',
      short_description: '',
      color: '',
      id: '',
      work_active: false,
      is_active: false,
    },
  });

  async function onSubmit(values: NewDiagramType) {
    values.short_description = values.short_description.toUpperCase();

    const method = diagramToEdit ? 'PUT' : 'POST';
    const url = diagramToEdit
      ? `${URL}/api/employees/diagrams/tipos`
      : `${URL}/api/employees/diagrams/tipos?actual=${company_id}`;

    toast.promise(
      async () => {
        const data = JSON.stringify(values);
        const response = await fetch(url, {
          method,
          body: data,
        });
        return response;
      },
      {
        loading: 'Cargando...',
        success: diagramToEdit
          ? `Novedad ${values.name} editada con éxito`
          : `Novedad ${values.name} cargada con éxito`,
        error: diagramToEdit ? 'No se pudo editar la novedad' : 'No se pudo crear la novedad',
      }
    );

    cleanForm();
    router.refresh();
  }

  function cleanForm() {
    form.reset({
      name: '',
      short_description: '',
      color: '',
      id: '',
    });
    setDiagramToEdit(false);
  }

  useEffect(() => {
    if (selectedDiagram) {
      form.reset({
        name: selectedDiagram.name,
        short_description: selectedDiagram.short_description,
        color: selectedDiagram.color,
        id: selectedDiagram.id,
        work_active: selectedDiagram.work_active,
        is_active: selectedDiagram.is_active,
      });
      setDiagramToEdit(true);
    } else {
      form.reset({
        name: '',
        short_description: '',
        color: '',
        id: '',
        work_active: false,
        is_active: false,
      });
      setDiagramToEdit(false);
    }
  }, [selectedDiagram, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[300px]">
        <h2 className="text-xl font-bold mb-4">{diagramToEdit ? 'Editar Novedad' : 'Crear Novedad'}</h2>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la novedad</FormLabel>
              <Input placeholder="Ingresa un nombre para la novedad" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción corta</FormLabel>
              <Input placeholder="Ingresa una descripción corta, ej: TD" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Input className=" w-20" placeholder="Elige un color" type="color" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="work_active"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel></FormLabel>
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" checked={field.value} onCheckedChange={field.onChange} />
                  <Label htmlFor="airplane-mode">Laboralmente Activo</Label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  className="flex space-x-1"
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

        {!diagramToEdit ? (
          <div className="flex gap-x-4">
            <Button variant="gh_orange" className="mt-4" type="submit">
              Crear
            </Button>
          </div>
        ) : (
          <div className="flex gap-x-4">
            <Button variant="gh_orange" className="mt-4" type="submit">
              Actualizar
            </Button>
            <Button variant="outline" className="mt-4" type="button" onClick={() => cleanForm()}>
              Cancelar
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}

// Si tengo un boton que dice "Editar" necesito tener un boton que diga "Limpiar formulario", para que el usuario pueda limpiar el formulario y cargar uno nuevo

//si selectedDiagram tiene algo, se debe cargar el formulario con los valores de selectedDiagram
//si selectedDiagram no tiene nada, se debe cargar el formulario vacio
//si selectedDiagram tiene algo, se debe hacer un fetch de tipo PUT en vez de POST
//si selectedDiagram tiene algo, el toast de success debe decir que se edito con exito
//si selectedDiagram tiene algo, el toast de error debe decir que no se pudo editar
