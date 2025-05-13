'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { customersSchema } from '@/zodSchemas/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function createdCustomer(formData: FormData) {
  const supabase = supabaseServer();
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data } = await supabase
      .from('profile')
      .select('*')
      .eq('email', session?.user.email || '');

    const { data: Companies, error } = await supabase
      .from('company')
      .select(`*`)
      .eq('owner_id', data?.[0]?.id || '');

    let { data: share_company_users, error: sharedError } = await supabase
      .from('share_company_users')
      .select(`*`)
      .eq('profile_id', data?.[0]?.id || '');

    revalidatePath('/dashboard/company/customers');

    const form = Object.fromEntries(formData.entries());

    const client = customersSchema.parse(form);

    const clientData = {
      name: client.company_name,
      cuit: client.client_cuit,
      client_email: client.client_email,
      client_phone: client.client_phone,
      address: client.address,
      // company_id: Companies?.[0].id
      company_id: formData.get('company_id'),
    };

    const { data: existingClient, error: clientError } = await supabase
      .from('customers')
      .select('*')
      .eq('name', clientData.name)
      .eq('cuit', clientData.cuit)
      .eq('client_email', clientData.client_email || '')
      .eq('client_phone', clientData.client_phone || '')
      .eq('address', clientData.address || '')
      .eq('company_id', clientData.company_id || '')
      .single();

    if (existingClient) {
      return { status: 400, body: 'El cliente ya existe en esta empresa' };
    }

    // Guardar datos en la tabla 'customer'
    const newClient = await supabase
      .from('customers')
      .insert(clientData as any)
      .select();
    if (newClient) {
      return { status: 201, body: 'Cliente creado satisfactoriamente.' };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 400, body: JSON.stringify(error.errors) };
    }
    console.error(error);
    return { status: 500, body: 'Internal Server Error' };
  }
  redirect('/dashboard/company/actualCompany');
}

export async function updateCustomer(formData: FormData) {
  const supabase = supabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data } = await supabase
    .from('profile')
    .select('*')
    .eq('email', session?.user.email || '');

  const { data: Companies, error } = await supabase
    .from('company')
    .select(`*`)
    .eq('owner_id', data?.[0]?.id || '');

  let { data: share_company_users, error: sharedError } = await supabase
    .from('share_company_users')
    .select(`*`)
    .eq('profile_id', data?.[0]?.id || '');

  revalidatePath('/dashboard/company/actualCompany');

  const id = formData.get('id');

  const clientData = {
    name: formData.get('company_name'),
    cuit: formData.get('client_cuit'),
    client_email: formData.get('client_email'),
    client_phone: formData.get('client_phone'),
    address: formData.get('address'),
    company_id: formData.get('company_id'),
  };

  try {
    // Guardar datos en la tabla 'customer'

    const editClient = await supabase
      .from('customers')
      .update([clientData] as any)
      .eq('id', id || '')
      .select();

    return { status: 200, body: 'Cliente actualizado satisfactoriamente' };
  } catch (error) {
    console.error(error);
    return { status: 500, body: 'Internal Server Error' };
  }

  redirect('/dashboard/company/actualCompany');
}

export async function fechAllCustomers() {
  const supabase = supabaseServer();
  try {
    const { data, error } = await supabase.from('customers').select('*').eq('is_active', true);

    if (error) {
      console.error(error);
      return [];
    }

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createArea(values: any) {
  const supabase = supabaseServer();
  try {
    const { data: area, error: areaError } = await supabase
      .from('areas_cliente' as any)
      .insert({
        nombre: values.name,
        descripcion_corta: values.descripcion_corta,
        customer_id: values.customer_id,
      })
      .select('*');

    if (areaError) {
      return { status: 500, body: 'Internal Server Error' };
    }

    const areaId = area?.[0]?.id;
    const provinceId = values.province_id as number[];
    const provinces = provinceId.map((id: number) => ({
      area_id: areaId,
      province_id: id,
    }));

    const { error: provinceError } = await supabase.from('area_province' as any).insert(provinces as any);

    if (provinceError) {
      // Si falla el insert en areas_province, eliminamos el area recien creado
      await supabase
        .from('areas_cliente' as any)
        .delete()
        .match({ id: areaId });
      return { status: 500, body: 'Internal Server Error' };
    }

    // revalidatePath('/dashboard/company/actualCompany');
    return { status: 200, body: 'Area creada satisfactoriamente' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 400, body: JSON.stringify(error.errors) };
    }
    console.error(error);
    return { status: 500, body: 'Internal Server Error' };
  }
}

export async function updateArea(values: any) {
  const supabase = supabaseServer();
  try {
    const { data: area, error: areaError } = await supabase
      .from('areas_cliente' as any)
      .update({
        nombre: values.name,
        descripcion_corta: values.descripcion_corta,
        customer_id: values.customer_id,
      })
      .eq('id', values.id)
      .select('*');

    if (areaError) {
      return { status: 500, body: 'Internal Server Error' };
    }

    const provinceId = values.province_id as number[];
    const provinces = provinceId.map((id: number) => ({
      area_id: values.id,
      province_id: id,
    }));

    const { error: provinceError } = await supabase
      .from('area_province' as any)
      .delete()
      .eq('area_id', values.id);

    if (provinceError) {
      return { status: 500, body: 'Internal Server Error' };
    }

    const { error: provinceInsertError } = await supabase.from('area_province' as any).insert(provinces as any);

    if (provinceInsertError) {
      return { status: 500, body: 'Internal Server Error' };
    }

    return { status: 200, body: 'Area actualizada satisfactoriamente' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 400, body: JSON.stringify(error.errors) };
    }
    console.error(error);
    return { status: 500, body: 'Internal Server Error' };
  }
}

export async function fetchAreasWithProvinces() {
  const supabase = supabaseServer();
  try {
    const { data, error } = await supabase
      .from('areas_cliente')
      .select(
        `
        id,
        nombre,
        descripcion_corta,
        customers (
          id,
          name
        ),
        area_province (
          provinces ( id, name )
          )
          `
      )
      .not('area_province.province_id', 'is', null);

    if (error) {
      console.error(error);
      return [];
    }

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchEquipmentsCustomers() {
  const supabase = supabaseServer();
  try {
    const { data: equipments, error } = await supabase.from('equipos_clientes').select('*');
    if (error) {
      console.error(error);
      return { equipments: [], error: 'Error al obtener los equipos' };
    }
    return { equipments, error };
  } catch (error) {
    console.error(error);
    return { equipments: [], error: 'Error al obtener los equipos' };
  }
}

export async function createEquipmentCustomer(values: any) {
  const supabase = supabaseServer();
  try {
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipos_clientes' as any)
      .insert({
        name: values.name,
        customer_id: values.customer_id,
        type: values.type,
      })
      .select('*');

    if (equipmentError) {
      return { status: 500, body: 'Internal Server Error' };
    }

    return { status: 200, body: 'Equipo creado satisfactoriamente' };
  } catch (error) {
    console.error(error);
    return { status: 500, body: 'Internal Server Error' };
  }
}

export async function updateEquipmentCustomer(values: any) {
  const supabase = supabaseServer();

  try {
    const { data: equipment, error } = await supabase
      .from('equipos_clientes' as any)
      .update({
        name: values.name,
        customer_id: values.customer_id,
        type: values.type,
      })
      .eq('id', values.id)
      .select('*'); // traer el equipo actualizado

    if (error) {
      console.error('Error updating equipment:', error.message);
      return { status: 500, body: error.message };
    }

    if (!equipment || equipment?.length === 0) {
      return { status: 404, body: 'Equipo no encontrado o no actualizado.' };
    }

    return { status: 200, body: 'Equipo actualizado satisfactoriamente' };
  } catch (error) {
    console.error('Unexpected error updating equipment:', error);
    return { status: 500, body: 'Unexpected server error.' };
  }
}

export async function fetchAllSectors() {
  const supabase = supabaseServer();
  try {
    const { data: sectors, error } = await supabase
      .from('sectors' as any)
      .select('*,sector_customer(sector_id(id,name), customer_id(id,name))')
      .returns<SectorWithCustomers[]>();

    if (error) {
      console.error(error);
      return { sectors: [], error: 'Error al obtener los sectores' };
    }
    return { sectors, error: null };
  } catch (error) {
    console.error(error);
    return { sectors: [], error: 'Error al obtener los sectores' };
  }
}

export async function createSector(values: any) {
  const supabase = supabaseServer();
  try {
    const { data: sector, error: sectorError } = await supabase
      .from('sectors' as any)
      .insert({
        name: values.name,
        descripcion_corta: values.descripcion_corta,
      })
      .select('*');

    if (sectorError) {
      return { status: 500, body: 'Internal Server Error' };
    }

    const sectorId = sector?.[0]?.id;

    const { error: sectorCustomerError } = await supabase.from('sector_customer' as any).insert({
      sector_id: sectorId,
      customer_id: values.customer_id,
    });

    if (sectorCustomerError) {
      await supabase
        .from('sectors' as any)
        .delete()
        .match({ id: sectorId });
      return { status: 500, body: 'Internal Server Error' };
    }

    // revalidatePath('/dashboard/company/actualCompany');
    return { status: 200, body: 'Sector creado satisfactoriamente' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 400, body: JSON.stringify(error.errors) };
    }
    console.error(error);
    return { status: 500, body: 'Internal Server Error' };
  }
}

export async function updateSector(values: any) {
  const supabase = supabaseServer();

  try {
    const { data: sector, error: sectorError } = await supabase
      .from('sectors' as any)
      .update({
        name: values.name,
        descripcion_corta: values.descripcion_corta,
      })
      .eq('id', values.id)
      .select('*');

    if (sectorError) {
      return { status: 500, body: 'Internal Server Error' };
    }

    const customerIds = Array.isArray(values.customer_id) ? values.customer_id : [values.customer_id];

    const customers = customerIds.map((id: string) => ({
      sector_id: values.id,
      customer_id: id,
    }));

    const { error: deleteError } = await supabase
      .from('sector_customer' as any)
      .delete()
      .eq('sector_id', values.id);

    if (deleteError) {
      return { status: 500, body: 'Internal Server Error' };
    }

    const { error: insertError } = await supabase.from('sector_customer' as any).insert(customers);

    if (insertError) {
      return { status: 500, body: 'Internal Server Error' };
    }

    return { status: 200, body: 'Sector actualizado satisfactoriamente' };
  } catch (error) {
    console.error(error);
    return { status: 500, body: 'Internal Server Error' };
  }
}
