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
  area_id: string;
  sector_id: string;
  service_name: string;
  service_start: Date;
  service_validity: Date;
  is_active: boolean;
  contract_number?: string;
};

export async function handleServiceSubmit(
  values: ServiceForm,
  company_id: string,
  resetForm: () => void,
  router: ReturnType<typeof useRouter>
) {
  const supabase = supabaseBrowser();

  try {
    const { data, error } = await supabase.from('customer_services').insert({
      company_id: company_id.replace(/"/g, ''),
      customer_id: values.customer_id,
      area_id: values.area_id,
      sector_id: values.sector_id,
      service_name: values.service_name,
      contract_number: values.contract_number || '',
      service_start: values.service_start.toISOString().split('T')[0],
      service_validity: values.service_validity.toISOString().split('T')[0],
      is_active: values.is_active,
    });

    if (error) {
      throw new Error(`Error al crear el servicio: ${error.message}`);
    }

    toast.success('Servicio creado correctamente');
    resetForm();
    router.refresh();
  } catch (error) {
    console.error('Error al crear el servicio:', error);
    toast.error('Error al crear el servicio');
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
    const { data, error } = await supabase
      .from('customer_services')
      .update({
        service_name: values.service_name,
        area_id: values.area_id,
        sector_id: values.sector_id,
        contract_number: values.contract_number || '',
        service_start: values.service_start.toISOString().split('T')[0],
        service_validity: values.service_validity.toISOString().split('T')[0],
        is_active: values.is_active,
      })
      .eq('id', editing_service_id);

    if (error) {
      throw new Error(`Error al actualizar el servicio: ${error.message}`);
    }

    toast.success('Servicio actualizado correctamente');
    resetForm();
    router.refresh();
  } catch (error) {
    console.error('Error al actualizar el servicio:', error);
    toast.error('Error al actualizar el servicio');
  }
}
