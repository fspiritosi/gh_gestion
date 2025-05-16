import { supabaseServer } from '@/lib/supabase/server';

export async function fetchServiceItems(customer_service_id: string) {
  const supabase = supabaseServer();

  try {
    const { data: items, error } = await supabase
      .from('service_items')
      .select(
        `
        *,
        item_measure_units (
          id,
          unit
        ),
        customer_services (
          id,
          service_name,
          customer_id (
            id,
            name
          )
        )
      `
      )
      .eq('customer_service_id', customer_service_id || '');

    if (error) {
      console.error('Error al obtener items del servicio:', error);
      return [];
    }

    return items || [];
  } catch (error) {
    console.error('Error inesperado al obtener items del servicio:', error);
    return [];
  }
}
