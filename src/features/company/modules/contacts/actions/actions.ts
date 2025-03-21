'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';

import { z } from 'zod';

export async function createdContact(formData: FormData) {
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

  revalidatePath('/dashboard/company/customers');

  const contactData = {
    contact_name: formData.get('contact_name')?.toString(),
    constact_email: formData.get('contact_email')?.toString(),
    contact_phone: Number(formData.get('contact_phone')),
    contact_charge: formData.get('contact_charge')?.toString(),
    company_id: formData.get('company_id')?.toString(),
    customer_id: formData.get('customer')?.toString(),
  };

  const { data: existingContact, error: contactError } = await supabase
    .from('contacts')
    .select('*')
    .eq('contact_name', contactData.contact_name || '')
    .eq('constact_email', contactData.constact_email || '')
    .eq('contact_phone', contactData.contact_phone || 0)
    .eq('contact_charge', contactData.contact_charge || '')
    .eq('company_id', contactData.company_id || '')
    .eq('customer_id', contactData.customer_id || '')
    .single();

  if (existingContact) {
    return { status: 400, body: 'El contacto ya existe en esta empresa' };
  }
  try {
    const createdContact = await supabase
      .from('contacts')
      .insert(contactData as any)
      .select();
    if (createdContact) {
      return { status: 201, body: 'Contacto creado satisfactoriamente.' };
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

export async function updateContact(formData: FormData) {
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

  const id = formData.get('id')?.toString();

  const contactData = {
    contact_name: formData.get('contact_name')?.toString(),
    constact_email: formData.get('contact_email')?.toString(),
    contact_phone: Number(formData.get('contact_phone')),
    contact_charge: formData.get('contact_charge')?.toString(),
    company_id: formData.get('company_id')?.toString(),
    // company_id: Companies?.[0].id,
    customer_id: formData.get('customer')?.toString(),
  };

  if (!id) {
    return { status: 400, body: 'ID no proporcionado' };
  }

  try {
    const editContact = await supabase
      .from('contacts')
      .update(contactData as any)
      .eq('id', id || '')
      .select();

    return { status: 200, body: 'Contacto actualizado satisfactoriamente' };
  } catch (error) {
    console.error(error);
    return { status: 500, body: 'Internal Server Error' };
  }

  redirect('/dashboard/company/actualCompany');
}

export async function fetchCustomers(companyId: string) {
  const supabase = supabaseServer();

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchCustomers:', error);
    throw error;
  }
}

export async function fetchContact(contactId: string) {
  const supabase = supabaseServer();

  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId);

    if (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }

    if (data && data.length > 0) {
      return data[0]; // Devuelve el primer contacto encontrado
    } else {
      throw new Error('No se encontró ningún contacto con el id proporcionado.');
    }
  } catch (error) {
    console.error('Error in fetchContact:', error);
    throw error;
  }
}
export async function fetchInactiveContacts(actualCompany: string) {
  const supabase = supabaseServer();
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', false)
      .eq('company_id', actualCompany);

    if (error) {
      console.error('Error fetching inactive contacts:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchInactiveContacts:', error);
    throw error;
  }
}

export async function reintegerContact(contactId: string) {
  const supabase = supabaseServer();

  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({
        is_active: true,
        termination_date: null,
        reason_for_termination: null,
      })
      .eq('id', contactId)
      .select();

    if (error) {
      throw new Error('Error reintegrando el contacto');
    }

    return { success: true, message: 'Contacto reintegrado correctamente' };
  } catch (error) {
    console.error('Error in reintegerContact:', error);
    throw error;
  }
}

export async function deactivateContact(
  values: any, 
  contactId: string, 
  companyId: string 
) {
  const supabase = supabaseServer();

  try {
    const data = {
      ...values,
      termination_date: format(values.termination_date, 'yyyy-MM-dd'),
    };

    const { error } = await supabase
      .from('contacts')
      .update({
        is_active: false,
        termination_date: data.termination_date,
        reason_for_termination: data.reason_for_termination,
      })
      .eq('id', contactId)
      .eq('company_id', companyId)
      .select();

    if (error) {
      throw new Error("error al dar de baja el contacto");
    }

    return { success: true, message: 'Contacto dado de baja correctamente' };
  } catch (error) {
    console.error('Error in deactivateContact:', error);
    throw error;
  }
}





