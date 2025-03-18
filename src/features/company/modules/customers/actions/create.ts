'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { customersSchema } from '@/zodSchemas/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { fetchCurrentUser,getOwnerUser } from '@/app/server/GET/actions';

export async function createdCustomer(formData: FormData) {
  const supabase = supabaseServer();
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const data = await fetchCurrentUser();
    console.log(data);


    // const { data: Companies, error } = await supabase
    //   .from('company')
    //   .select(`*`)
    //   .eq('owner_id', data?.[0]?.id || '');
    const ownerUser = await getOwnerUser();
    console.log(ownerUser);

    

    let { data: share_company_users, error: sharedError } = await supabase
      .from('share_company_users')
      .select(`*`)
      // .eq('profile_id', data?.[0]?.id || '');
      .eq('profile_id', data?.id || '');
    revalidatePath('/dashboard/company/customers');

    const form = Object.fromEntries(formData.entries()) as Record<string, string>;

    const client = customersSchema.parse(form);

    const clientData = {
      name: client.company_name,
      cuit: parseInt(client.client_cuit),
      client_email: client.client_email,
      client_phone: parseInt(client.client_phone),
      address: client.address,
      company_id: formData.get('company_id')?.toString() || '', 
    };
    console.log(clientData);

    // Verificar si el cliente ya existe en la tabla 'customer'
    const { data: existingClient, error: clientError } = await supabase
      .from('customers')
      .select('*')
      .eq('name', clientData.name)
      .eq('cuit', clientData.cuit) 
      .eq('client_email', clientData.client_email || '')
      .eq('client_phone', clientData.client_phone) 
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

  const id = formData.get('id') as string;
  if (!id) {
    throw new Error('ID no proporcionado');
  }

  const clientData = {
    name: formData.get('company_name') as string,
    cuit: formData.get('client_cuit') as string,
    client_email: formData.get('client_email') as string,
    client_phone: formData.get('client_phone') as string,
    address: formData.get('address') as string,
    company_id: formData.get('company_id') as string,
  };

  try {
    // Guardar datos en la tabla 'customer'
    const editClient = await supabase
      .from('customers')
      .update([clientData] as any)
      .eq('id', id)
      .select();

    return { status: 200, body: 'Cliente actualizado satisfactoriamente' };
  } catch (error) {
    console.error(error);
    return { status: 500, body: 'Internal Server Error' };
  }

  redirect('/dashboard/company/actualCompany');
}