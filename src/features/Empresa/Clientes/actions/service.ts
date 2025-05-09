import { supabaseServer } from '@/lib/supabase/server';

export async function fetchServices(company_id: string) {
  const supabase = supabaseServer();

  try {
    const { data: services, error } = await supabase
      .from('customer_services')
      .select('*')
      .eq('company_id', company_id || '');

    if (error) {
      console.error('Error al obtener servicios:', error);
      return [];
    }

    return services || [];
  } catch (error) {
    console.error('Error inesperado al obtener servicios:', error);
    return [];
  }
}
