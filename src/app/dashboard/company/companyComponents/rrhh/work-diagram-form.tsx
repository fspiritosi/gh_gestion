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
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Actualizar el esquema para eliminar el campo days
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  is_active: z.boolean(),
  active_working_days: z.number().int().min(0, {
    message: 'Active days must be a positive number.',
  }),
  active_novelty: z.string().optional(),
  inactive_working_days: z.number().int().min(0, {
    message: 'Inactive days must be a positive number.',
  }),
  inactive_novelty: z.string().optional(),
});

interface DiagramType {
  id: string;
  created_at: string;
  name: string;
  company_id: string;
  color: string;
  short_description: string;
  work_active: boolean;
}

type DiagramsTypes = DiagramType[];

type WorkDiagramFormValues = z.infer<typeof formSchema>;

interface WorkDiagramFormProps {
  diagram?: any | null;
  mode?: 'create' | 'edit' | 'view';
  diagramsTypes?: DiagramsTypes | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WorkDiagramForm({
  diagramsTypes,
  diagram,
  mode = 'create',
  onSuccess,
  onCancel,
}: WorkDiagramFormProps) {
  const form = useForm<WorkDiagramFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: diagram?.name || '',
      is_active: diagram?.is_active ?? true,
      active_working_days: diagram?.active_working_days || 0,
      inactive_working_days: diagram?.inactive_working_days || 0,
      active_novelty: diagram?.active_novelty?.id || null,
      inactive_novelty: diagram?.inactive_novelty?.id || null,
    },
  });

  const isViewMode = mode === 'view';

  useEffect(() => {
    if (diagram) {
      form.reset({
        name: diagram.name,
        is_active: diagram.is_active,
        active_working_days: diagram.active_working_days,
        inactive_working_days: diagram.inactive_working_days,
        active_novelty: diagram?.active_novelty || null,
        inactive_novelty: diagram?.inactive_novelty || null,
      });
    }
  }, [diagram, form]);

  async function onSubmit(values: WorkDiagramFormValues) {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}`;
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const endpoint = mode === 'edit' ? `/api/work-diagrams?id=${diagram?.id}` : '/api/work-diagrams';

      const response = await fetch(`${url}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  }

  return (
    <div className="container w-full mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter diagram name" {...field} disabled={isViewMode} className="w-[180px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    value={field.value ? 'true' : 'false'}
                    disabled={isViewMode}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Días activos */}
            <FormField
              control={form.control}
              name="active_working_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días activos continuos</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isViewMode}
                      className="w-[180px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active_novelty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Novedad Activa</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isViewMode}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo de Novedad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Novedad</SelectLabel>
                          {diagramsTypes
                            ?.filter((diagramType) => diagramType.work_active)
                            .map((diagramType) => (
                              <SelectItem key={diagramType.id} value={diagramType.id}>
                                {diagramType.name}
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

            {/* Días inactivos */}
            <FormField
              control={form.control}
              name="inactive_working_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días inactivos continuos</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isViewMode}
                      className="w-[180px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inactive_novelty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Novedad Inactiva</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isViewMode}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo de Novedad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Novedad</SelectLabel>
                          {diagramsTypes
                            ?.filter((diagramType) => !diagramType.work_active)
                            .map((diagramType) => (
                              <SelectItem key={diagramType.id} value={diagramType.id}>
                                {diagramType.name}
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
            <Button type="button" variant="outline" className="w-[180px]" onClick={onCancel}>
              {isViewMode ? 'Cerrar' : 'Cancelar'}
            </Button>

            {!isViewMode && (
              <Button type="submit" className="w-[180px]">
                {mode === 'edit' ? 'Actualizar' : 'Guardar'}
              </Button>
            )}
          </div>

          {/* <div className="mt-6 flex gap-4 justify-center">
            <Button type="button" variant="outline" className="w-[180px]" onClick={onCancel}>
              {isViewMode ? 'Cerrar' : 'Cancelar'}
            </Button>

            {!isViewMode && (
              <Button type="submit" className="w-[180px]">
                {mode === 'edit' ? 'Actualizar' : 'Guardar'}
              </Button>
            )}
          </div> */}
        </form>
      </Form>
    </div>
  );
}
