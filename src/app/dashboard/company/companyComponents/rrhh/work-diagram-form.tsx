'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  inactive_working_days: z.number().int().min(0, {
    message: 'Inactive days must be a positive number.',
  }),
});

type WorkDiagramFormValues = z.infer<typeof formSchema>;
// interface WorkDiagramFormProps {
//   onSuccess?: () => void;
//   onCancel?: () => void;
// }
// export default function WorkDiagramForm({ onSuccess, onCancel }: WorkDiagramFormProps) {
//   const form = useForm<WorkDiagramFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       isActive: true,
//       active_working_days: 0,
//       inactive_working_days: 0,
//     },
//   })

//   async function onSubmit(values: WorkDiagramFormValues) {
//     console.log(values);
//     const url = `${process.env.NEXT_PUBLIC_BASE_URL}`;

//     try {
//       const response = await fetch(`${url}/api/work-diagrams`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(values),
//       });
//       const data = await response.json();
//       console.log(data);

//       // Llama a onSuccess si existe
//       if (onSuccess) {
//         onSuccess();
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//     }
//   }

//   return (
//     <div className="container w-full mx-auto p-4">
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle>Diagrama de Trabajo</CardTitle>
//           <p className="text-muted-foreground">Configure su diagrama de trabajo</p>
//         </CardHeader>

//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 {/* Column 1 */}
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Nombre</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter diagram name" {...field} />
//                       </FormControl>
//                       <FormDescription>Aqui va el nombre de su diagrama.</FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Column 2 */}
//                 <FormField
//                   control={form.control}
//                   name="isActive"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Estado</FormLabel>
//                       <Select
//                         onValueChange={(value) => field.onChange(value === "true")}
//                         defaultValue={field.value ? "true" : "false"}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select status" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="true">Active</SelectItem>
//                           <SelectItem value="false">Inactive</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormDescription>Set whether this diagram is active or not.</FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Column 3 - Días activos continuos */}
//                 <FormField
//                   control={form.control}
//                   name="active_working_days"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Días activos continuos</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           placeholder="0"
//                           {...field}
//                           onChange={(e) => field.onChange(Number(e.target.value))}
//                         />
//                       </FormControl>
//                       <FormDescription>Número de días activos continuos</FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Column 4 - Días inactivos continuos */}
//                 <FormField
//                   control={form.control}
//                   name="inactive_working_days"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Días inactivos continuos</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           placeholder="0"
//                           {...field}
//                           onChange={(e) => field.onChange(Number(e.target.value))}
//                         />
//                       </FormControl>
//                       <FormDescription>Número de días inactivos continuos</FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="mt-6">
//                 <Button type="submit" className="w-full">
//                   Guardar
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
// work-diagram-form.tsx
interface WorkDiagramFormProps {
  diagram?: any | null;
  mode?: 'create' | 'edit' | 'view';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WorkDiagramForm({ diagram, mode = 'create', onSuccess, onCancel }: WorkDiagramFormProps) {
  const form = useForm<WorkDiagramFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: diagram?.name || '',
      is_active: diagram?.is_active ?? true,
      active_working_days: diagram?.active_working_days || 0,
      inactive_working_days: diagram?.inactive_working_days || 0,
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
      console.log(data);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter diagram name" {...field} disabled={isViewMode} />
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
                      <SelectTrigger>
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
                    />
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6 flex gap-4">
            <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
              {isViewMode ? 'Cerrar' : 'Cancelar'}
            </Button>

            {!isViewMode && (
              <Button type="submit" className="w-full">
                {mode === 'edit' ? 'Actualizar' : 'Guardar'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
