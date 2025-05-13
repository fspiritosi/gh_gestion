'use client';

import { supabaseBrowser } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Service = {
  id?: string;
  customer_id: string;
  area_id: string;
  sector_id: string;
  service_name: string;
  service_start: string;
  service_validity: string;
  is_active: boolean;
  contract_number?: string;
};

type ServiceForm = {
  id?: string;
  customer_id: string;
  area_id: string[];
  sector_id: string[];
  service_name: string;
  service_start: Date;
  service_validity: Date;
  is_active: boolean;
  contract_number?: string;
  service_areas?: Array<{
    area_id: string;
    areas_cliente: {
      id: string;
      nombre: string;
      descripcion_corta: string;
    };
  }>;
};

export async function handleServiceSubmit(
  values: ServiceForm,
  company_id: string,
  resetForm: () => void,
  router: ReturnType<typeof useRouter>
) {
  const supabase = supabaseBrowser();

  try {
    // 1. Crear el servicio
    const { data: serviceData, error } = await supabase
      .from('customer_services')
      .insert({
        company_id: company_id.replace(/"/g, ''),
        customer_id: values.customer_id,
        service_name: values.service_name,
        contract_number: values.contract_number || '',
        service_start: values.service_start.toISOString().split('T')[0],
        service_validity: values.service_validity.toISOString().split('T')[0],
        is_active: values.is_active,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Error al crear el servicio: ${error.message}`);
    }

    const serviceId = serviceData?.id;
    if (!serviceId) {
      throw new Error('No se pudo obtener el ID del servicio creado');
    }

    // 2. Crear relaciones de áreas
    if (values.area_id?.length) {
      const areaInserts = values.area_id.map((area_id) => ({
        service_id: serviceId,
        area_id,
      }));

      const { error: areaError } = await supabase.from('service_areas' as any).insert(areaInserts);

      if (areaError) {
        throw new Error(`Error al crear relaciones de áreas: ${areaError.message}`);
      }
    }

    // 3. Crear relaciones de sectores
    if (values.sector_id?.length) {
      const sectorInserts = values.sector_id.map((sector_id) => ({
        service_id: serviceId,
        sector_id,
      }));

      const { error: sectorError } = await supabase.from('service_sectors' as any).insert(sectorInserts);

      if (sectorError) {
        throw new Error(`Error al crear relaciones de sectores: ${sectorError.message}`);
      }
    }

    toast.success('Servicio creado correctamente');
    resetForm();
    router.refresh();
    return true;
  } catch (error) {
    console.error('Error al crear el servicio:', error);
    toast.error('Error al crear el servicio');
    return false;
  }
}

export async function handleServiceUpdate(
  values: ServiceForm,
  editing_service_id: string,
  resetForm: () => void,
  router: ReturnType<typeof useRouter>
) {
  const supabase = supabaseBrowser();

  try {
    // 1. Actualizar el servicio
    const { error: updateError } = await supabase
      .from('customer_services')
      .update({
        customer_id: values.customer_id,
        service_name: values.service_name,
        contract_number: values.contract_number || '',
        service_start: values.service_start.toISOString().split('T')[0],
        service_validity: values.service_validity.toISOString().split('T')[0],
        is_active: values.is_active,
      })
      .eq('id', editing_service_id);

    if (updateError) {
      throw new Error(`Error al actualizar el servicio: ${updateError.message}`);
    }

    // 2. Eliminar relaciones de áreas existentes
    const { error: deleteAreasError } = await supabase
      .from('service_areas' as any)
      .delete()
      .eq('service_id', editing_service_id);

    if (deleteAreasError) {
      throw new Error(`Error al eliminar relaciones de áreas: ${deleteAreasError.message}`);
    }

    // 3. Insertar nuevas relaciones de áreas
    if (values.area_id?.length) {
      const areaInserts = values.area_id.map((area_id) => ({
        service_id: editing_service_id,
        area_id,
      }));

      const { error: areaError } = await supabase.from('service_areas' as any).insert(areaInserts);

      if (areaError) throw new Error(`Error al actualizar áreas: ${areaError.message}`);
    }

    // 4. Eliminar relaciones de sectores existentes
    const { error: deleteSectorsError } = await supabase
      .from('service_sectors' as any)
      .delete()
      .eq('service_id', editing_service_id);

    if (deleteSectorsError) {
      throw new Error(`Error al eliminar relaciones de sectores: ${deleteSectorsError.message}`);
    }

    // 5. Insertar nuevas relaciones de sectores
    if (values.sector_id?.length) {
      const sectorInserts = values.sector_id.map((sector_id) => ({
        service_id: editing_service_id,
        sector_id,
      }));

      const { error: sectorError } = await supabase.from('service_sectors' as any).insert(sectorInserts);

      if (sectorError) throw new Error(`Error al actualizar sectores: ${sectorError.message}`);
    }

    toast.success('Servicio actualizado correctamente');
    resetForm();
    router.refresh();
  } catch (error) {
    console.error('Error al actualizar el servicio:', error);
    toast.error('Error al actualizar el servicio');
  }
}
