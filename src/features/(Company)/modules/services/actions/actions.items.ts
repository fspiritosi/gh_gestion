import { Item, Service } from '@/features/company/modules/services/types/types';
import { toast } from 'sonner';

const URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchServices = async (company_id: string) => {
  try {
    const servicesResponse = await fetch(`${URL}/api/services?actual=${company_id}`);

    if (!servicesResponse.ok) {
      throw new Error('Error al obtener los servicios');
    }
    const responseData = await servicesResponse.json();
    const services = Array.isArray(responseData) ? responseData : responseData.services;
    return services;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const itemOnSubmit = async (values: any, company_id: string, resetForm: () => void) => {
  const modified_company_id = company_id.replace(/"/g, '');
  const modified_editing_service_id = values.customer_service_id.replace(/"/g, '');
  const updatedValues = { ...values, customer_service_id: modified_editing_service_id };
  const data = JSON.stringify(updatedValues);

  try {
    const response = await fetch(`/api/services/items?actual=${modified_company_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud');
    }
    const result = await response.json();
    toast.success('Item creado correctamente');
    resetForm();
  } catch (error) {
    console.error('Error al crear el item:', error);
    toast.error('Error al crear el item');
  }
};

export const itemOnUpdate = async (
  values: Service,
  editingService: Item,
  company_id: string,
  resetForm: () => void
) => {
  const modified_company_id = company_id.replace(/"/g, '');
  const data = JSON.stringify(values);

  try {
    const modified_editing_service_id = editingService?.id?.toString().replace(/"/g, '');

    const response = await fetch(`/api/services/items?id=${modified_editing_service_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud');
    }
    const result = await response.json();
    toast.success('Item actualizado correctamente');
    resetForm();
  } catch (error) {
    console.error('Error al actualizar el item:', error);
    toast.error('Error al actualizar el item');
  }
};

export const handleDeactivateItem = async (editingService: Item, setFilteredItems: any) => {
  if (editingService) {
    try {
      const newActiveState = !editingService.is_active;

      const response = await fetch(`/api/services/items/?id=${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newActiveState }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setFilteredItems((prevItems: any) =>
          prevItems.map((item: any) => (item.id === updatedItem.id ? updatedItem : item))
        );
        toast.success(`Item ${newActiveState ? 'activado' : 'desactivado'} correctamente`);
      } else {
        console.error('Error al desactivar el item');
        toast.error('Error al desactivar el item');
      }
    } catch (error) {
      console.error('Error al desactivar el item:', error);
      toast.error('Error al desactivar el item');
    }
  }
};
