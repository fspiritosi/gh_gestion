'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const getSupabaseClient = async () => {
  const {
    data: { session },
  } = await createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true },
  }).auth.getSession();

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

let supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true },
});
export interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  url: string;
  path: string;
  contract_id: string;
  description: string;
  [key: string]: any;
}

export const fetchContract = async (id: string, session: any) => {
  try {
    // Primero obtenemos el contrato básico
    const { data: contract, error: contractError } = await supabase
      .from('customer_services')
      .select('*')
      .eq('id', id)
      .single();

    if (contractError || !contract) {
      console.error('Error fetching contract:', contractError);
      return null;
    }

    // Obtenemos el cliente
    const { data: customer } = contract.customer_id
      ? await supabase.from('customers').select('name').eq('id', contract.customer_id).single()
      : { data: null };

    // Obtenemos el área
    const { data: area } = contract.area_id
      ? await supabase.from('areas_cliente').select('nombre').eq('id', contract.area_id).single()
      : { data: null };

    // Obtenemos el sector del contrato
    const { data: sector } = contract.sector_id
      ? await supabase.from('service_sectors').select('name').eq('id', contract.sector_id).single()
      : { data: null };

    // Obtenemos la compañía
    const { data: company } = contract.company_id
      ? await supabase.from('company').select('company_name').eq('id', contract.company_id).single()
      : { data: null };

    // Construimos el objeto de respuesta
    return {
      ...contract,
      customer_id: customer ? { name: customer.name } : null,
      area_id: area ? { nombre: area.nombre } : null,
      sector_id: sector ? { name: sector.name } : null,
      company_id: company ? { company_name: company.company_name } : null,
    };
  } catch (error) {
    console.error('Unexpected error in fetchContract:', error);
    return null;
  }
};

export const fetchDocuments = async (contractId: string, session: any): Promise<Document[]> => {
  try {
    // Verificar que se proporcionó una sesión
    if (!session) {
      throw new Error('No se proporcionó una sesión de usuario');
    }

    // Configurar el cliente con la sesión proporcionada
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    // Obtener metadatos de los documentos
    const { data: documentMetadata, error: metadataError } = await authClient
      .from('documents_contracts' as any)
      .select('*')
      .eq('contract_id', contractId);

    if (metadataError) {
      throw metadataError;
    }

    // Si no hay documentos, retornar array vacío
    if (!documentMetadata || documentMetadata.length === 0) {
      return [];
    }

    // Obtener URLs firmadas para cada documento
    const documentsWithUrls = await Promise.all(
      documentMetadata.map(async (doc: any) => {
        try {
          const { data: urlData, error: urlError } = await authClient.storage
            .from('contract-documents')
            .createSignedUrl(doc.path, 60 * 60); // URL válida por 1 hora

          if (urlError) {
            console.error('Error al generar URL firmada para', doc.path, urlError);
            return {
              ...doc,
              url: '',
              error: 'No se pudo cargar el archivo',
            };
          }

          return {
            ...doc,
            url: urlData?.signedUrl || '',
          };
        } catch (urlError) {
          console.error('Error al generar URL para', doc.path, urlError);
          return {
            ...doc,
            url: '',
            error: 'Error al cargar el archivo',
          };
        }
      })
    );

    return documentsWithUrls;
  } catch (error) {
    console.error('Error al cargar documentos:', error);
    throw error;
  }
};

export const uploadDocument = async ({
  file,
  contractId,
  contract,
  docType,
  docDescription,
  session,
}: {
  file: File;
  contractId: string;
  contract: any;
  docType: string;
  docDescription: string;
  session: any;
}): Promise<void> => {
  try {
    // Verificar que el contrato y sus propiedades existan
    if (!contract) {
      throw new Error('Información del contrato no disponible');
    }

    // Verificar que se proporcionó una sesión
    if (!session) {
      throw new Error('No se proporcionó una sesión de usuario');
    }

    // Configurar el cliente con la sesión proporcionada
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    // Usar el cliente configurado con la sesión
    const supabase = authClient;

    // Manejo seguro de valores nulos
    const companyName = contract?.company_id?.company_name || 'company_desconocida';
    const customerName = contract?.customer_id?.name || 'cliente_desconocido';
    const contractTitle = contract?.service_name || 'contrato_sin_titulo';

    if (!companyName || !customerName || !contractTitle) {
      console.error('Datos incompletos:', { companyName, customerName, contractTitle });
      throw new Error('Información incompleta del contrato');
    }

    const createSafeFolderName = (name: string) => {
      if (!name) return 'default';
      return name
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .replace(/-+/g, '_');
    };

    const companyFolderName = createSafeFolderName(companyName);
    const customerFolderName = createSafeFolderName(customerName);
    const contractFolderName = createSafeFolderName(contractTitle);

    let type = 'otro';
    if (file.type.includes('pdf')) type = 'pdf';
    else if (file.type.includes('image')) type = 'image';
    else if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))
      type = 'spreadsheet';
    else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) type = 'document';

    const filePath = `${companyFolderName}/${customerFolderName}/${contractFolderName}/${Date.now()}_${file.name}`;

    try {
      // Subir archivo al storage
      const { error: uploadError } = await supabase.storage
        .from('contract-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error al subir archivo:', uploadError);
        throw new Error(`Error al subir el archivo: ${uploadError.message}`);
      }

      // Insertar metadatos en la base de datos
      const { error: insertError } = await supabase.from('documents_contracts' as any).insert([
        {
          contract_id: contractId,
          name: file.name,
          type,
          size: file.size,
          path: filePath,
          description: docDescription || docType,
          date: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error('Error al insertar metadatos:', insertError);
        // Intentar eliminar el archivo si falla la inserción
        try {
          await supabase.storage.from('contract-documents').remove([filePath]);
        } catch (cleanupError) {
          console.error('Error al limpiar archivo subido:', cleanupError);
        }
        throw new Error(`Error al guardar los metadatos: ${insertError.message}`);
      }
    } catch (error) {
      console.error('Error en uploadDocument:', error);
      // Asegurarse de que el error sea un objeto con propiedad message
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir el documento';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error en uploadDocument:', error);
    if (error instanceof Error) {
      throw error; // Si ya es un Error, lo lanzamos tal cual
    }
    throw new Error('Error desconocido al procesar la solicitud');
  }
};

export const deleteDocument = async (document: Document, session: any): Promise<void> => {
  if (!document) {
    throw new Error('No se proporcionó un documento para eliminar');
  }

  if (!session) {
    throw new Error('No se proporcionó una sesión de usuario');
  }

  // Configurar el cliente con la sesión proporcionada
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  try {
    // Primero eliminamos el registro de la base de datos
    const { error: dbError } = await authClient.from('documents_contracts').delete().eq('id', document.id);

    if (dbError) {
      console.error('Error al eliminar el registro de la base de datos:', dbError);
      throw new Error(`Error al eliminar el registro: ${dbError.message}`);
    }

    // Luego eliminamos el archivo del storage
    const { error: storageError } = await authClient.storage.from('contract-documents').remove([document.path]);

    if (storageError) {
      console.error('Error al eliminar el archivo del storage:', storageError);
      // No lanzamos error aquí para no interrumpir el flujo ya que el registro ya fue eliminado
      console.warn('El registro fue eliminado pero hubo un error al eliminar el archivo físico');
    }
  } catch (error) {
    console.error('Error en deleteDocument:', error);
    throw new Error(`Error al eliminar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

export const downloadDocument = async (document: Document): Promise<string> => {
  const { data, error } = await supabase.storage.from('contract-documents').createSignedUrl(document.path, 60); // URL válida por 1 minuto

  if (error) {
    throw new Error(`Error al generar la URL de descarga: ${error.message}`);
  }

  return data.signedUrl;
};
