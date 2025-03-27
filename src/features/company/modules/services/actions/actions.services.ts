import { toast } from 'sonner';
import { Service } from '../types/types';

export const ServiceSubmit = async (values: Service, company_id: string, resetForm: () => void, router: any) => {
  const modified_company_id = company_id?.replace(/"/g, '');

  const data = JSON.stringify(values);
  try {
    const response = await fetch(`/api/services?actual=${modified_company_id}`, {
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
    toast.success('Servicio creado correctamente');
    router.refresh();
    resetForm();
  } catch (error) {
    console.error('Error al crear el servicio:', error);
    toast.error('Error al crear el servicio');
  }
};

export const ServiceUpdate = async (
  values: Service,
  modified_editing_service_id: string,
  resetForm: () => void,
  router: any
) => {
  const data = JSON.stringify(values);
  try {
    const response = await fetch(`/api/services/?id=${modified_editing_service_id}`, {
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
    toast.success('Servicio actualizado correctamente');
    resetForm();
    router.refresh();
  } catch (error) {
    console.error('Error al actualizar el servicio:', error);
    toast.error('Error al actualizar el servicio');
  }
};

export const handleDeactivateService = async (
  editingService: Service & { is_active: boolean },
  modified_editing_service_id: string,
  setFilteredServices: any,
  router: any
) => {
  if (editingService) {
    try {
      const newActiveState = !editingService.is_active;
      const response = await fetch(`/api/services/?id=${modified_editing_service_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...editingService, is_active: newActiveState }),
      });

      if (response.ok) {
        const updatedService = await response.json();
        setFilteredServices((prevServices: any) =>
          prevServices?.map((service: any) => (service.id === updatedService.id ? updatedService : service))
        );
        toast.success(`Servicio ${newActiveState ? 'activado' : 'desactivado'} correctamente`);
        router.refresh();
      } else {
        console.error('Error al desactivar el servicio');
        toast.error('Error al desactivar el servicio');
      }
    } catch (error) {
      console.error('Error al desactivar el servicio:', error);
    }
  }
};
