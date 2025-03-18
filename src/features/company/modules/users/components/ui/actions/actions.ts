import { supabase } from '../../../../../../../../supabase/supabase';
import { handleSupabaseError } from '@/lib/errorHandler';

export const createUserWithRole = async (values: any, companyId: string, activeTab: string) => {
  try {
    if (!companyId) {
      throw new Error('No se encontró la empresa');
    }

    let { data: profile, error } = await supabase.from('profile').select('*').eq('email', values.email);

    if (error) {
      throw new Error(handleSupabaseError(error.message));
    }

    if (profile && profile.length > 0) {
      const { error: duplicatedError, data: sharedCompany } = await supabase
        .from('share_company_users')
        .select('*')
        .eq('profile_id', profile[0].id)
        .eq('company_id', companyId);

      if (sharedCompany && sharedCompany.length > 0) {
        throw new Error('El usuario ya tiene acceso a la empresa');
      }

      const { data, error: shareError } = await supabase.from('share_company_users').insert([
        {
          company_id: companyId,
          profile_id: profile[0].id,
          role: values.role,
          customer_id: values.customer ? values.customer : null,
        },
      ]);

      if (shareError) {
        throw new Error(handleSupabaseError(shareError.message));
      }

      return 'Usuario registrado correctamente';
    }

    if (activeTab === 'InviteUser') {
      throw new Error('No se encontró un usuario con ese correo');
    }

    if (!profile || profile.length === 0) {
      const { data, error: authError } = await supabase.auth.admin.createUser({
        email: values.email,
        password: values.password!,
        email_confirm: true,
      });

      if (authError) {
        throw new Error(handleSupabaseError(authError.message));
      }

      if (data) {
        const { data: user, error: profileError } = await supabase
          .from('profile')
          .insert([
            {
              id: data.user?.id,
              email: values.email,
              fullname: `${values.firstname} ${values.lastname}`,
              role: 'CodeControlClient',
              credential_id: data.user?.id,
            },
          ])
          .select();

        if (profileError) {
          throw new Error(handleSupabaseError(profileError.message));
        }

        if (user) {
          const { data: shareData, error: shareError } = await supabase.from('share_company_users').insert([
            {
              company_id: companyId,
              profile_id: user[0].id,
              role: values.role,
              customer_id: values.customer ? values.customer : null,
            },
          ]);

          if (shareError) {
            throw new Error(handleSupabaseError(shareError.message));
          }

          return 'Usuario registrado correctamente';
        }
      }
    }
  } catch (error) {
    throw error;
  }
};