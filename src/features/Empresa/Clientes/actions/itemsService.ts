import { supabaseBrowser } from '@/lib/supabase/browser';
import { toast } from 'sonner';

let currentEditingService: any = null;
let currentEditService: any = null;
let currentCompanyId: string = '';
let currentIsEditing: boolean = false;
let currentGetItems: (() => void) | null = null;
let currentReset: (() => void) | null = null;

export async function handleSubmit(
  values: any,
  editingService: any,
  editService: any,
  company_id: string,
  isEditing: boolean,
  getItems: () => void,
  reset: () => void
) {
  const supabase = supabaseBrowser();

  try {
    const { data, error } = isEditing
      ? await supabase
          .from('service_items')
          .update({
            item_name: values.item_name,
            item_description: values.item_description,
            code_item: values.code_item,
            item_number: values.item_number,
            item_measure_units: Number(values.item_measure_units),
            item_price: values.item_price,
            is_active: values.is_active,
            company_id: editService?.company_id,
          })
          .eq('id', editingService?.id)
      : await supabase.from('service_items').insert({
          customer_service_id: editingService?.id || editService?.id,
          item_name: values.item_name,
          item_description: values.item_description,
          code_item: values.code_item,
          item_number: values.item_number,
          item_measure_units: Number(values.item_measure_units),
          item_price: values.item_price,
          is_active: values.is_active,
          company_id: editService?.company_id,
        });

    if (error) {
      throw new Error(`Error al ${isEditing ? 'actualizar' : 'crear'} el item: ${error.message}`);
    }

    toast.success(`Item ${isEditing ? 'actualizado' : 'creado'} correctamente`);
    getItems();

    if (!isEditing) {
      reset();
    }
  } catch (error) {
    console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el item:`, error);
    toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el item`);
  }
}

export async function fetchServiceItems(customer_service_id: string) {
  const supabase = supabaseBrowser();

  try {
    const { data: items, error } = await supabase
      .from('service_items')
      // .select('*,item_measure_units(id,unit),customer_service_id(id,service_name),customer_id(id,name)')
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
      // .eq('id', customer_service_id || '');
      // Filters
      .eq('customer_service_id', customer_service_id || '');
    // .eq('company_id', company_id || '');

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
