export type VehicleType = {
  year: string;
  engine?: string;
  chassis?: string;
  serie?: string;
  domain?: string; // Solo string o undefined
  intern_number: string;
  picture?: string;
  type_of_vehicle: string;
  type: string;
  allocated_to?: string[];
  brand: string;
  model: string;
  kilometer?: string;
  // Propiedades adicionales
  types_of_vehicles?: { name: string };
  brand_vehicles?: { name: string };
  model_vehicles?: { name: string };
  id?: string;
  condition?: 'operativo' | 'no operativo' | 'en reparación' | 'operativo condicionado';
};

export type generic = {
  name: string;
  id: string;
};

export type dataType = {
  tipe_of_vehicles: generic[];
  models: {
    name: string;
    id: string;
  }[];
};
