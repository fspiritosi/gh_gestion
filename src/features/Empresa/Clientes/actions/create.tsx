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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data: customers, error } = await supabase.from('customers').select('*').eq('is_active', true);

    return { customers, error };
  } catch (error) {
    console.error(error);
    return { customers: [], error: 'Error al obtener los clientes' };
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
    const { data: areasWithProvinces, error } = await supabase
      .from('areas_cliente' as any)
      .select(
        `
        id,
        nombre,
        descripcion_corta,
        customer_id(id, name),
        area_province (
          provinces ( id, name )
        )
      `
      )
      .not('area_province.province_id', 'is', null);
    // .eq('is_active', true);

    if (error) {
      console.error(error);
      return { areasWithProvinces: [], error: 'Error al obtener las areas con sus provincias' };
    }

    return { areasWithProvinces, error };
  } catch (error) {
    console.error(error);
    return { areasWithProvinces: [], error: 'Error al obtener las areas con sus provincias' };
  }
}
