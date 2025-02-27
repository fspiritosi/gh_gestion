export type Company = {
    id?: string;
    company_name: string;
    company_cuit: string;
    description: string;
    website: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    city: {
      id: number;
      name: string;
    };
    country: string;
    industry: string;
    company_logo: string;
    province_id: {
      id: number;
      name: string;
    };
    by_defect: boolean;
    owner_id: string | undefined;
  };