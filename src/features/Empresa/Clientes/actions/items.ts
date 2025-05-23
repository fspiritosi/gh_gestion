import { supabaseBrowser } from '@/lib/supabase/browser';

export async function fetchServiceItems(customer_service_id: string) {
  const supabase = supabaseBrowser();

  try {
    const { data: items, error } = await supabase
      .from('service_items')
      .select(
        `
        *,
        item_measure_units (
          id,
          unit
        )
      `
      )
      .eq('customer_service_id', customer_service_id);

    if (error) {
      console.error('Error al obtener items del servicio:', error);
      return [];
    }

    return items || [];
  } catch (error) {
    console.error('Error al obtener items del servicio:', error);
    return [];
  }
}
