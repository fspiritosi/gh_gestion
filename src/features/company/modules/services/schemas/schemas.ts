import { z } from 'zod';

export const ItemsSchema = z.object({
  customer_id: z.string().nonempty(),
  customer_service_id: z.string().nonempty(),
  item_name: z.string().min(1, { message: 'Debe ingresar el nombre del servicio' }),
  item_description: z.string().min(1, { message: 'Debe ingresar una descripción del servicio' }),
  item_price: z.preprocess((val) => Number(val), z.number().min(0, { message: 'Debe ingresar un precio válido' })),
  item_measure_units: z.string().min(1, { message: 'Debe seleccionar la unidad de medida' }),
  is_active: z.boolean().optional(),
});

export const EditItemSchema = z.object({
  customer_id: z.string().optional(),
  customer_service_id: z.string().optional(),
  item_name: z.string().optional(),
  item_description: z.string().optional(),
  item_price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, { message: 'Debe ingresar un precio válido' }).optional()
  ),
  item_measure_units: z.string().optional(),
});

export const ServiceSchema = z
  .object({
    id: z.string().optional(),
    customer_id: z.string().min(1, { message: 'Debe seleccionar un cliente' }),
    service_name: z.string().min(1, { message: 'Debe ingresar el nombre del servicio' }),
    service_start: z.date(),
    service_validity: z.date(),
  })
  .refine((data) => data.service_validity > data.service_start, {
    message: 'La validez del servicio debe ser mayor que el inicio del servicio',
    path: ['service_validity'],
  });
