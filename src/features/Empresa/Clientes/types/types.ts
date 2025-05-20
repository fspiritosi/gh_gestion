export interface Equipment {
  id: string;
  name: string;
  type: 'Perforador' | 'Perforador Spudder' | 'Work over' | 'Fractura' | 'Coiled Tubing';
  customer_id: string;
}

export interface Customer {
  id: string;
  name: string;
  company_id: string;
  address: string | null;
  client_email: string | null;
  client_phone: number | null;
  created_at: string;
  cuit: number;
  is_active: boolean | null;
  reason_for_termination: string | null;
  termination_date: string | null;
}

export interface Sector {
  id: string;
  name: string;
  created_at: string | null;
  descripcion_corta: string | null;
  sector_customer: {
    created_at: string | null;
    customer_id: string;
    id: string;
    sector_id: string;
    customers: {
      address: string | null;
      client_email: string | null;
      client_phone: number | null;
      company_id: string;
      created_at: string;
      cuit: number;
      id: string;
      is_active: boolean | null;
      name: string;
      reason_for_termination: string | null;
      termination_date: string | null;
    } | null;
  }[];
}
