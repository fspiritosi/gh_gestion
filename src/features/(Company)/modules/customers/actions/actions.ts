'use server';

import { fetchCurrentUser, getOwnerUser } from '@/app/server/GET/actions';
import { supabaseServer } from '@/lib/supabase/server';
import { customersSchema } from '@/zodSchemas/schemas';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
// import { toast } from 'sonner';
// import { useEdgeFunctions } from '@/hooks/useEdgeFunctions';
import { format } from 'date-fns';
// import { errorTranslate }
const supabase = supabaseServer();

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
  // redirect('/dashboard/company/actualCompany');
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

  // redirect('/dashboard/company/actualCompany');
}

export const fetchInactiveCustomer = async (companyId: string | undefined) => {
  try {
    if (!companyId) {
      throw new Error('No se proporcionó un ID de empresa');
    }

    const { data, error } = await supabaseServer()
      .from('customers')
      .select('*')
      //.eq('is_active', false) // Descomenta si necesitas filtrar por is_active
      .eq('company_id', companyId);

    if (error) {
      console.error(error);
      throw error;
    }

    return data; // Devuelve los datos obtenidos
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export async function reintegerCustomer(customers: any, actualCompany: any) {
  try {
    const { data, error } = await supabaseServer()
      .from('customers')
      .update({ is_active: true })
      .eq('id', customers)
      .eq('company_id', actualCompany)
      .select();

    if (error) throw error;

    return { success: true, message: 'Cliente reintegrado correctamente' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deactivateCustomer(
  values: any,
  customerId: string,
  companyId: string,
  employ: any[] = [], // Inicializar como array vacío si es undefined
  equip: any[] = [] // Inicializar como array vacío si es undefined
) {
  const supabase = supabaseServer();

  const data = {
    ...values,
    termination_date: format(values.termination_date, 'yyyy-MM-dd'),
  };

  try {
    // Actualizar el cliente en la tabla 'customers'
    await supabase
      .from('customers')
      .update({
        is_active: false,
        termination_date: data.termination_date,
        reason_for_termination: data.reason_for_termination,
      })
      .eq('id', customerId)
      .eq('company_id', companyId)
      .select();
  } catch (error: any) {
    throw error;
  }

  try {
    // Actualizar los contactos asociados al cliente
    await supabase
      .from('contacts')
      .update({
        is_active: false,
      })
      .eq('customer_id', customerId)
      .eq('company_id', companyId)
      .select();
  } catch (error: any) {
    throw error;
  }

  try {
    // Actualizar los empleados asignados al cliente
    if (employ && Array.isArray(employ)) {
      const updatedEmployeesPromises = employ.map((employee: any) => {
        const updatedAllocatedTo = employee.allocated_to?.filter((clientId: string) => clientId !== customerId);
        return supabase.from('employees').update({ allocated_to: updatedAllocatedTo }).eq('id', employee.id);
      });

      await Promise.all(updatedEmployeesPromises);
    }
  } catch (error: any) {
    throw error;
  }

  try {
    // Actualizar los equipos asignados al cliente
    if (equip && Array.isArray(equip)) {
      const updatedEquipmentPromises = equip.map((equipment: any) => {
        const updatedAllocatedTo = equipment.allocated_to?.filter((clientId: string) => clientId !== customerId);
        return supabase.from('vehicles').update({ allocated_to: updatedAllocatedTo }).eq('id', equipment.id);
      });

      await Promise.all(updatedEquipmentPromises);
    }
  } catch (error: any) {
    throw error;
  }
}
