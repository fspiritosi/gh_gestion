import { z } from 'zod';
import { validarCUIL } from '../../../../../lib/utils';

export const customersSchema = z.object({
    company_name: z
      .string({ required_error: 'El nombre es requerido' })
      .min(2, {
        message: 'El nombre debe tener al menos 2 caracteres.',
      })
      .max(40, { message: 'EL nombre debe tener menos de 40 caracteres.' }),
  
    client_cuit: z
      .string({ required_error: 'El cuit es requerido' })
      .refine((value) => /^\d{11}$/.test(value), {
        message: 'El CUIT debe contener 11 números.',
      })
      .refine(
        (cuil) => {
          return validarCUIL(cuil);
        },
        { message: 'El CUIT es inválido' }
      ),
  
    address: z.string({ required_error: 'la calle es requerida' }).min(2, {
      message: 'La dirección debe tener al menos 2 caracteres.',
    }),
  
    client_phone: z
      .string({ required_error: 'El numero de teléfono es requerido' })
      .min(4, {
        message: 'El teléfono debe tener al menos 4 caracteres.',
      })
      .max(15, {
        message: 'El teléfono debe tener menos de 15 caracteres.',
      }),
    client_email: z
      .string()
      .email({
        message: 'Email inválido',
      })
      .optional(),
  });