'use client';
import { fetchCustomers } from '@/app/server/GET/actions';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { useCompanyStore } from '@/features/(Company)/store/companyStore';
import { createUserWithRole } from '@/features/company/modules/users/actions/actions';
import { registerSchemaWithRole } from '@/features/company/modules/users/schemas/schemas';
import { useLoggedUserStore } from '@/store/loggedUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '../../../../../../supabase/supabase';
export const RegisterWithRole = () => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [open, setOpen] = useState(false);
  const ownerUser = useLoggedUserStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState('InviteUser');
  const [clientData, setClientData] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('');

  const company = useCompanyStore();
  const [userType, setUserType] = useState<'Usuario' | 'Invitado' | null>(null);

  const schema = registerSchemaWithRole(activeTab);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      customer: '',
    },
  });

  const [roles, setRoles] = useState<any[] | null>([]);

  const getRoles = async () => {
    let { data: roles, error } = await supabase.from('roles').select('*').eq('intern', false).neq('name', 'Invitado');
    setRoles(roles);
  };

  useEffect(() => {
    getRoles();
    const cust = fetchCustomers();
    cust.then((data) => {
      setClientData(data);
    });
  }, []);
  console.log(clientData);
  const FetchSharedUsers = useLoggedUserStore((state) => state.FetchSharedUsers);
  const router = useRouter();
  console.log(company.currentCompanyId);

  function onSubmit(values: z.infer<typeof schema>) {
    if (values?.email?.trim().toLocaleLowerCase() === ownerUser?.[0].email.toLocaleLowerCase()) {
      toast.error('No puedes compartir la empresa contigo mismo');
      return;
    }

    // Verificar si company es null o undefined
    if (!company) {
      toast.error('No se encontró la empresa');
      return;
    }

    // Asegurarse de que company.id es un string
    const companyId = company.currentCompanyId;

    toast.promise(
      async () => {
        return createUserWithRole(values, companyId as string, activeTab);
      },
      {
        loading: 'Invitando usuario...',
        success: (message) => {
          setOpen(false);
          FetchSharedUsers();
          return message;
        },
        error: (error) => {
          return error;
        },
      }
    );
    router.refresh();
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  const handleOpen = (type: 'Usuario' | 'Invitado') => {
    setUserType(type);
    setSelectedRole('Usuario');
    form.setValue('role', 'Usuario');
    if (type === 'Invitado') {
      setSelectedRole('Invitado');
      form.setValue('role', 'Invitado');
    }
    setOpen(true);
  };

  return (
    <div className="flex items-center justify-between space-y-2">
      <div></div>
      <div>
        <AlertDialog open={open} onOpenChange={() => setOpen(!open)}>
          <AlertDialogTrigger asChild>
            <Button variant="default" className="mr-2" onClick={() => handleOpen('Usuario')}>
              Agregar Usuario
            </Button>
          </AlertDialogTrigger>
          <AlertDialogTrigger asChild>
            <Button variant="default" className="ml-2" onClick={() => handleOpen('Invitado')}>
              Agregar Invitado
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
            <AlertDialogTitle>Compartir acceso a la empresa</AlertDialogTitle>
            <Tabs
              value={activeTab}
              onValueChange={(e) => {
                handleTabChange(e);
              }}
              className=""
            >
              <TabsList className="w-full">
                <TabsTrigger className="w-1/2" value="createUser">
                  {userType === 'Usuario' ? 'Crear usuario' : 'Crear Invitado'}
                </TabsTrigger>
                <TabsTrigger className="w-1/2" value="InviteUser">
                  Invitar usuario
                </TabsTrigger>
              </TabsList>
              <TabsContent value="createUser">
                <AlertDialogHeader>
                  <AlertDialogDescription asChild>
                    <Form {...form}>
                      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                          control={form.control}
                          name="firstname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input placeholder="Escribe tu nombre aquí" {...field} />
                              </FormControl>
                              <FormDescription>Por favor ingresa tu nombre.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apellido</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu apellido" {...field} />
                              </FormControl>
                              <FormDescription>Por favor ingresa tu apellido.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo</FormLabel>
                              <FormControl>
                                <Input placeholder="ejemplo@correo.com" autoComplete="email" {...field} />
                              </FormControl>
                              <FormDescription>Por favor ingresa tu correo.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contraseña</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    placeholder="Elige una contraseña segura"
                                    type={showPasswords ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    {...field}
                                  />
                                </FormControl>
                                <Toggle onClick={() => setShowPasswords(!showPasswords)} variant={'outline'}>
                                  {showPasswords ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                </Toggle>
                              </div>
                              <FormDescription>Por favor ingresa tu contraseña.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar contraseña</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    placeholder="Repite tu contraseña"
                                    type={showPasswords ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    {...field}
                                  />
                                </FormControl>
                                <Toggle onClick={() => setShowPasswords(!showPasswords)} variant={'outline'}>
                                  {showPasswords ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                </Toggle>
                              </div>
                              <FormDescription>Por favor ingresa otra vez tu contraseña.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rol</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedRole(value); // Actualiza el estado del rol seleccionado
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar rol" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* {roles?.map((role) => (
                                      <SelectItem key={role.id} value={role.name}>
                                        {role.name}
                                      </SelectItem>
                                    ))} */}
                                  {selectedRole === 'Invitado' ? (
                                    <SelectItem key="invitado" value="Invitado">
                                      Invitado
                                    </SelectItem>
                                  ) : (
                                    roles?.map((role) => (
                                      <SelectItem key={role.id} value={role.name}>
                                        {role.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {selectedRole === 'Invitado' && (
                          <div>
                            <FormField
                              control={form.control}
                              name="customer"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cliente</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    defaultValue={selectedRole !== 'Invitado' ? ' ' : field.value}
                                  >
                                    <SelectTrigger id="customer" name="customer" className="max-w-[500px] w-[450px]">
                                      <SelectValue placeholder={'Seleccionar un cliente'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {clientData?.map((client: any) => (
                                        <SelectItem
                                          key={client?.id}
                                          value={selectedRole !== 'Invitado' ? null : client?.id}
                                        >
                                          {client?.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        <div className="flex justify-end gap-4">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <Button type="submit">Agregar</Button>
                        </div>
                      </form>
                    </Form>
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </TabsContent>
              <TabsContent value="InviteUser">
                <AlertDialogHeader>
                  <AlertDialogDescription asChild>
                    <Form {...form}>
                      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="ml-3">Correo</FormLabel>
                              <FormControl>
                                <Input placeholder="ejemplo@correo.com" autoComplete="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="ml-3">Rol</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedRole(value); // Actualiza el estado del rol seleccionado
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar rol" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* {roles?.map((role) => (
                                      <SelectItem key={role.id} value={role.name}>
                                        {role.name}
                                      </SelectItem>
                                    ))} */}
                                  {selectedRole === 'Invitado' ? (
                                    <SelectItem key="invitado" value="Invitado">
                                      Invitado
                                    </SelectItem>
                                  ) : (
                                    roles?.map((role) => (
                                      <SelectItem key={role.id} value={role.name}>
                                        {role.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {selectedRole === 'Invitado' && (
                          <div>
                            <FormField
                              control={form.control}
                              name="customer"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cliente</FormLabel>
                                  <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger id="customer" name="customer" className="max-w-[500px] w-[450px]">
                                      <SelectValue placeholder={'Seleccionar un cliente'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {clientData?.map((client: any) => (
                                        <SelectItem
                                          key={client?.id}
                                          value={selectedRole !== 'Invitado' ? null : client?.id}
                                        >
                                          {client?.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        <div className="flex justify-end gap-4">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <Button type="submit">Agregar</Button>
                        </div>
                      </form>
                    </Form>
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </TabsContent>
            </Tabs>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
