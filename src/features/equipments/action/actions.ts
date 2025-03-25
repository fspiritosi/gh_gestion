// services/vehicleServices.ts
import { supabase } from '../../../../supabase/supabase';
import { VehicleType, generic, dataType } from '@/features/equipments/type/type';
import { vehicleSchema } from '@/features/equipments/schemas/schemas';
import { z } from 'zod';
import { handleSupabaseError } from '@/lib/errorHandler';
import { toast } from 'sonner';

// Función para obtener los tipos de vehículos
export const fetchVehicleTypes = async (): Promise<generic[]> => {
  const { data: types_of_vehicles, error } = await supabase.from('types_of_vehicles').select('*');
  if (error) throw new Error(error.message);
  return types_of_vehicles as generic[];
};

// Función para obtener los modelos de vehículos por marca
export const fetchVehicleModels = async (brand_id: string): Promise<generic[]> => {
  const { data: model_vehicles, error } = await supabase.from('model_vehicles').select('*').eq('brand', brand_id);
  if (error) throw new Error(error.message);
  return model_vehicles as generic[];
};

// Función para crear un nuevo vehículo
export async function onCreate(values: z.infer<typeof vehicleSchema>, uploadImage: any, imageFile: File | null, actualCompany: any, vehicleType: any, data: any, brand_vehicles: any, router: any) {
  return toast.promise(
    async () => {
      try {
        const newVehicleData = {
          type_of_vehicle: data.tipe_of_vehicles.find((e: any) => e.name === values.type_of_vehicle)?.id,
          brand: brand_vehicles?.find((e: any) => e.name === values.brand)?.id,
          model: data.models.find((e: any) => e.name === values.model)?.id,
          year: values.year,
          engine: values.engine,
          chassis: values.chassis,
          serie: values.serie,
          domain: values.domain?.toUpperCase(),
          intern_number: values.intern_number,
          picture: values.picture,
          allocated_to: values.allocated_to,
          kilometer: values.kilometer,
          type: vehicleType.find((e: any) => e.name === values.type)?.id,
          company_id: actualCompany?.id,
        };

        // Insertar el nuevo vehículo en Supabase
        const { data: insertedVehicle, error } = await supabase
          .from('vehicles')
          .insert(newVehicleData)
          .select()
          .single();

        if (error) throw new Error(error.message);

        // Si hay imagen, subirla
        if (imageFile) {
          const fileExtension = imageFile.name.split('.').pop();
          const renamedFile = new File([imageFile], `${insertedVehicle.id}.${fileExtension}`, {
            type: `image/${fileExtension}`,
          });

          await uploadImage(renamedFile, 'vehicle_photos');

          const vehicleImage = `${process.env.NEXT_PUBLIC_PROJECT_URL}/vehicle_photos/${insertedVehicle.id}.${fileExtension}`;
          await supabase
            .from('vehicles')
            .update({ picture: vehicleImage })
            .eq('id', insertedVehicle.id)
            .eq('company_id', actualCompany?.id);
        }

        router.refresh();
      } catch (error) {
        throw new Error('Error al crear el vehículo');
      }
    },
    {
      loading: 'Guardando...',
      success: 'Vehículo creado',
      error: 'Error al crear el vehículo',
    }
  );
}

// Función para actualizar un vehículo existente
export async function onUpdate(vehicle: any, values: z.infer<typeof vehicleSchema>, uploadImage: any, imageFile: File | null, actualCompany: any, vehicleType: any, data: any, brand_vehicles: any, router: any) {
  function compareContractorEmployees(originalObj: any, modifiedObj: any) {
    const originalSet = new Set(originalObj?.allocated_to);
    const modifiedSet = new Set(modifiedObj?.allocated_to);

    return {
      valuesToRemove: [...originalSet].filter((value) => !modifiedSet.has(value)),
      valuesToAdd: [...modifiedSet].filter((value) => !originalSet.has(value)),
      valuesToKeep: [...originalSet].filter((value) => modifiedSet.has(value)),
    };
  }

  function getUpdatedFields(originalObj: any, modifiedObj: any) {
    const updatedFields: any = {};
    for (const key in modifiedObj) {
      if (modifiedObj[key] !== originalObj[key]) {
        updatedFields[key] = modifiedObj[key];
      }
    }
    return updatedFields;
  }

  return toast.promise(
    async () => {
      const { brand_vehicles: brandd, model_vehicles, types_of_vehicles, ...rest } = vehicle;
      const result = compareContractorEmployees(rest, values);

      result.valuesToRemove.forEach(async (e) => {
        await supabase.from('contractor_equipment').delete().eq('equipment_id', vehicle?.id).eq('contractor_id', e);
      });

      await Promise.all(
        result.valuesToAdd.map(async (e) => {
          if (!result.valuesToKeep.includes(e)) {
            await supabase.from('contractor_equipment').insert({ equipment_id: vehicle?.id, contractor_id: e });
          }
        })
      );

      const updatedFields = getUpdatedFields(rest, {
        type_of_vehicle: data.tipe_of_vehicles.find((e: any) => e.name === values.type_of_vehicle)?.id,
        brand: brand_vehicles?.find((e: any) => e.name === values.brand)?.id,
        model: data.models.find((e: any) => e.name === values.model)?.id,
        year: values.year,
        engine: values.engine,
        chassis: values.chassis,
        serie: values.serie,
        domain: values.domain?.toUpperCase(),
        intern_number: values.intern_number,
        picture: values.picture,
        allocated_to: values.allocated_to,
        kilometer: values.kilometer,
        type: vehicleType.find((e: any) => e.name === values.type)?.id,
      });

      try {
        await supabase.from('vehicles').update(updatedFields).eq('id', vehicle?.id).eq('company_id', actualCompany?.id);

        if (imageFile) {
          const fileExtension = imageFile.name.split('.').pop();
          const renamedFile = new File([imageFile], `${vehicle?.id}.${fileExtension}`, { type: `image/${fileExtension}` });
          await uploadImage(renamedFile, 'vehicle_photos');

          const vehicleImage = `${process.env.NEXT_PUBLIC_PROJECT_URL}/vehicle_photos/${vehicle?.id}.${fileExtension}`;
          await supabase.from('vehicles').update({ picture: vehicleImage }).eq('id', vehicle?.id).eq('company_id', actualCompany?.id);
        }

        router.refresh();
      } catch (error) {
        throw new Error('Error al editar el equipo');
      }
    },
    {
      loading: 'Guardando...',
      success: 'Equipo editado',
      error: 'Error al editar el equipo',
    }
  );
}

// Función para subir una imagen
export const uploadImage = async (file: File, bucket: string) => {
  const { error } = await supabase.storage.from(bucket).upload(file.name, file);
  if (error) throw new Error(error.message);
};