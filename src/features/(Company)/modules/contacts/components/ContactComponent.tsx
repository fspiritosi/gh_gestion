'use client';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanyStore } from '@/features/(Company)/store/companyStore';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { cn } from '@/lib/utils';
import { contactSchema } from '@/zodSchemas/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {toast } from 'sonner';
import { z } from 'zod';
import { createdContact, fetchContact, fetchCustomers, updateContact } from '../actions/actions';
import ContactFormSkeleton from '@/features/(Company)/modules/contacts/components/skeletons/contactSkeleton';

type Action = 'view' | 'edit' | null;
type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactRegister({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = supabaseBrowser();
  
  // Obtener solo lo necesario del store
  const { currentCompanyId, fetchCompany } = useCompanyStore(state => ({
    currentCompanyId: state.currentCompanyId,
    fetchCompany: state.fetchCompany
  }));
  
  const [action, setAction] = useState<Action>(searchParams.get('action') as Action);
  const [readOnly, setReadOnly] = useState(action === 'edit' ? false : true);
  const [clientData, setClientData] = useState<any[]>([]);
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      contact_charge: '',
      customer: '',
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors: formErrors } } = form;
  const customerValue = watch('customer');
  const functionAction = id ? updateContact : createdContact;

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Asegurarnos de tener el companyId
        if (!currentCompanyId) {
          await fetchCompany();
          return;
        }

        const actionParam = searchParams.get('action') as Action;
        setAction(actionParam);
        
        if (actionParam === 'view') {
          setReadOnly(true);
        } else if (actionParam === 'edit') {
          setReadOnly(false);
        } else if (!id) {
          setReadOnly(false);
        }

        // Cargar clientes
        const customers = await fetchCustomers(currentCompanyId);
        setClientData(customers);

        // Cargar contacto si hay ID
        if (id) {
          const contact = await fetchContact(id);
          setContactData(contact);
          setValue('contact_name', contact?.contact_name || '');
          setValue('contact_email', contact?.constact_email || '');
          setValue('contact_phone', contact?.contact_phone?.toString() || '');
          setValue('contact_charge', contact?.contact_charge || '');
          setValue('customer', contact?.customer_id || '');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [id, searchParams, currentCompanyId]);

  const onSubmit = async (formData: ContactFormValues) => {
    try {
      if (!formData.customer || formData.customer === 'undefined') {
        throw new Error('Debe seleccionar un cliente válido.');
      }

      if (!currentCompanyId) {
        throw new Error('No se ha seleccionado una empresa');
      }

      const data = new FormData();
      data.append('id', id);
      data.append('contact_name', formData.contact_name);
      data.append('contact_email', formData.contact_email || '');
      data.append('contact_phone', formData.contact_phone);
      data.append('contact_charge', formData.contact_charge);
      data.append('customer', formData.customer);
      data.append('company_id', currentCompanyId);

      // toast.loading(id ? 'Actualizando contacto...' : 'Creando contacto...');

      const response = await functionAction(data);

      if (response.status === 201 || response.status === 200) {
        toast.dismiss();
        toast.success(id ? 'Contacto actualizado!' : 'Contacto creado!');
        router.push('/dashboard/company/actualCompany');
      } else {
        throw new Error(response.body || 'Error desconocido');
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Error al procesar el contacto');
    }
  };

  if (loading) {
    return (
      // <div className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center">
      //   <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      // </div>
      <ContactFormSkeleton />
    );
  }

  return (
    <section className={cn('md:mx-7')}>
      <Card className="mt-6 p-8">
        <CardTitle className="text-4xl mb-3">
          {action === 'edit' ? 'Editar Contacto' : 'Registrar Contacto'}
        </CardTitle>
        <CardDescription>
          {action === 'edit' 
            ? 'Edita este formulario con los datos de tu Contacto' 
            : 'Completa este formulario con los datos de tu nuevo Contacto'}
        </CardDescription>
        
        <div className="mt-6 rounded-xl flex w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <input type="hidden" name="id" value={id} />

            <div className="flex flex-wrap gap-3 items-center w-full">
              <div>
                <Label htmlFor="contact_name">Nombre del Contacto</Label>
                <Input
                  id="contact_name"
                  {...register('contact_name')}
                  className="max-w-[350px] w-[300px]"
                  placeholder="Nombre del contacto"
                  readOnly={readOnly}
                />
                {formErrors.contact_name && (
                  <span className="text-red-500 text-sm">{formErrors.contact_name.message}</span>
                )}
              </div>

              <div>
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  {...register('contact_email')}
                  className="max-w-[350px] w-[300px]"
                  placeholder="Email"
                  readOnly={readOnly}
                />
                {formErrors.contact_email && (
                  <span className="text-red-500 text-sm">{formErrors.contact_email.message}</span>
                )}
              </div>

              <div>
                <Label htmlFor="contact_phone">Teléfono</Label>
                <Input
                  id="contact_phone"
                  {...register('contact_phone')}
                  className="max-w-[350px] w-[300px]"
                  placeholder="Teléfono"
                  readOnly={readOnly}
                />
                {formErrors.contact_phone && (
                  <span className="text-red-500 text-sm">{formErrors.contact_phone.message}</span>
                )}
              </div>

              <div>
                <Label htmlFor="customer">Cliente</Label>
                <Select
                  value={customerValue}
                  onValueChange={(value) => setValue('customer', value)}
                  disabled={readOnly}
                >
                  <SelectTrigger className="max-w-[350px] w-[300px]">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientData.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.customer && (
                  <span className="text-red-500 text-sm">{formErrors.customer.message}</span>
                )}
              </div>

              <div>
                <Label htmlFor="contact_charge">Cargo</Label>
                <Input
                  id="contact_charge"
                  {...register('contact_charge')}
                  className="max-w-[350px] w-[300px]"
                  placeholder="Cargo en la empresa"
                  readOnly={readOnly}
                />
                {formErrors.contact_charge && (
                  <span className="text-red-500 text-sm">{formErrors.contact_charge.message}</span>
                )}
              </div>
            </div>

            {!readOnly && (
              <Button type="submit" className="mt-5">
                {id ? 'Actualizar Contacto' : 'Registrar Contacto'}
              </Button>
            )}
          </form>
        </div>
      </Card>
      {/* <Toaster position="top-right" /> */}
    </section>
  );
}