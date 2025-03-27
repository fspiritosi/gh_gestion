import { z } from 'zod';
import { ItemsSchema, ServiceSchema } from '../schemas/schemas';

export type Item = {
  id: string;
  item_name: string;
  item_description: string;
  item_measure_units: { id: string };
  item_price: number;
  is_active: boolean;
  customer_id: { id: string; name: string };
  customer_service_id: { customer_id: { id: string; name: string } };
  company_id: string;
};

export type customer = {
  id: string;
  name: string;
};

export type measure_unit = {
  id: number;
  unit: string;
  simbol: string;
  tipo: string;
};

export type UpdatedFields = {
  item_name?: string;
  item_description?: string;
  item_price?: number;
  item_measure_units?: number;
  is_active?: boolean;
};

export type Services = {
  id: string;
  service_name: string;
  customer_id: string;
  description: string;
  service_price: number;
  service_start: string;
  service_validity: string;
  is_active: true;
};

export type Customer = {
  id: string;
  name: string;
};

export type EditServiceFields = Omit<z.infer<typeof ItemsSchema>, 'customer_id' | 'customer_service_id'>;
export type Service = z.infer<typeof ServiceSchema>;
