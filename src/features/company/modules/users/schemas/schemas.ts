// src/lib/schemas/schemas.ts
import { z } from 'zod';

// Esquema para la contraseña
export const passwordSchema = z
  .string()
  .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  .max(50, { message: 'La contraseña debe tener menos de 50 caracteres.' })
  .regex(/[A-Z]/, {
    message: 'La contraseña debe tener al menos una mayúscula.',
  })
  .regex(/[a-z]/, {
    message: 'La contraseña debe tener al menos una minúscula.',
  })
  .regex(/[0-9]/, { message: 'La contraseña debe tener al menos un número.' })
  .regex(/[^A-Za-z0-9]/, {
    message: 'La contraseña debe tener al menos un carácter especial.',
  });

// Esquema para el registro con rol
export const registerSchemaWithRole = (activeTab: string) =>
  z
    .object({
      firstname:
        activeTab === 'InviteUser'
          ? z.string().optional()
          : z
              .string()
              .min(2, {
                message: 'El nombre debe tener al menos 2 caracteres.',
              })
              .max(30, {
                message: 'El nombre debe tener menos de 30 caracteres.',
              })
              .regex(/^[a-zA-Z ]+$/, {
                message: 'El nombre solo puede contener letras.',
              })
              .trim(),
      lastname:
        activeTab === 'InviteUser'
          ? z.string().optional()
          : z
              .string()
              .min(2, {
                message: 'El apellido debe tener al menos 2 caracteres.',
              })
              .max(30, {
                message: 'El apellido debe tener menos de 30 caracteres.',
              })
              .regex(/^[a-zA-Z ]+$/, {
                message: 'El apellido solo puede contener letras.',
              })
              .trim(),
      email: z.string().email({ message: 'Email inválido' }),
      role: z.string({ required_error: 'El rol es requerido' }).min(1, {
        message: 'El rol debe tener al menos 1 caracteres.',
      }),
      customer: z.string({ required_error: 'El cliente es requerido' }).optional(),
      password: activeTab === 'InviteUser' ? z.string().optional() : passwordSchema,
      confirmPassword: activeTab === 'InviteUser' ? z.string().optional() : passwordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Las contraseñas no coinciden.',
      path: ['confirmPassword'],
    });
export type RegisterSchemaWithRole = z.infer<ReturnType<typeof registerSchemaWithRole>>;
