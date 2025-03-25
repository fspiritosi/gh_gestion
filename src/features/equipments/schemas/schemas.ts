import { z } from 'zod';

export const formSchema = z.object({
  reason_for_termination: z.string({
    required_error: 'La razón de la baja es requerida.',
  }),
  termination_date: z.date({
    required_error: 'La fecha de baja es requerida.',
  }),
});




export const vehicleSchema = z.object({
  brand: z.string({ required_error: 'La marca es requerida' }).optional(),
  model: z.string({ required_error: 'El modelo es requerido' }).optional(),
  year: z.string({ required_error: 'El año es requerido' }).refine(
    (e) => {
      const year = Number(e);
      const actualYear = new Date().getFullYear();
      return year >= 1900 && year <= actualYear;
    },
    { message: 'El año debe ser mayor a 1900 y menor al año actual.' }
  ),
  engine: z.string().min(2).max(30).optional(),
  type_of_vehicle: z.string({ required_error: 'El tipo es requerido' }),
  chassis: z.string().optional(),
  kilometer: z.string().optional(),
  domain: z.string().optional().nullable(),
  serie: z.string().optional(),
  intern_number: z.string().min(2).max(30),
  picture: z.string().optional(),
  type: z.string().optional(),
  allocated_to: z.array(z.string()).optional(),
});


export const getVehicleSchema = (hideInput: boolean) => z.object({
  brand: z.string({ required_error: 'La marca es requerida' }).optional(),
  model: z.string({ required_error: 'El modelo es requerido' }).optional(),
  year: z
    .string({ required_error: 'El año es requerido' })
    .refine((e) => {
      const year = Number(e);
      const actualYear = new Date().getFullYear();
      return year >= 1900 && year <= actualYear;
    }, { message: 'El año debe estar entre 1900 y el actual.' }),
  
  engine: z.string().min(2).max(30).optional(),
  type_of_vehicle: z.string({ required_error: 'El tipo es requerido' }),

  chassis: hideInput
    ? z.string().min(2).max(30).optional()
    : z.string({ required_error: 'El chasis es requerido' }).min(2).max(30),

  kilometer: z.string().optional(),

  domain: hideInput
    ? z.string().optional()
    : z.string({ required_error: 'El dominio es requerido' })
        .min(6, { message: 'Debe tener al menos 6 caracteres.' })
        .max(7, { message: 'Debe tener menos de 7 caracteres.' }),

  serie: hideInput
    ? z.string().optional()
    : z.string({ required_error: 'La serie es requerida' }).min(2).max(30),

  intern_number: z.string({ required_error: 'El número interno es requerido' }).min(2).max(30),
  picture: z.string().optional(),
  type: hideInput ? z.string().optional() : z.string({ required_error: 'El tipo es requerido' }),
  allocated_to: z.array(z.string()).optional(),
});

