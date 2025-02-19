'use client';

import { UploadImage } from '@/components/UploadImage';
import { AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { updateProfileAvatar } from '../../actions/actions.navbar';
import { UserMenuProps } from '../../types/navbar.types';

export function _UserMenu({ user, onLogout }: UserMenuProps) {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const form = useForm();

  const handleAvatarUpdate = async (imageUrl: string) => {
    if (!user?.id) return;

    try {
      await updateProfileAvatar(user.id, imageUrl);
      form.setValue('profile', imageUrl);
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer" asChild>
          <Avatar className="size-9">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback>
              {user?.fullname
                ?.split(' ')
                .map((name) => name[0])
                .join('')
                .toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.fullname}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShowProfileDialog(true)}>Editar perfil</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Button variant="destructive" className="w-full" onClick={onLogout}>
              Cerrar Sesión
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>Aqui se haran cambios en tu perfil</DialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="w-[300px] flex gap-2">
              <FormProvider {...form}>
                <FormField
                  control={form.control}
                  name="company_logo"
                  render={({ field }) => (
                    <FormItem className="max-w-[600px] flex flex-col justify-center">
                      <FormControl>
                        <div className="flex lg:items-center flex-wrap md:flex-nowrap flex-col lg:flex-row gap-8">
                          <UploadImage
                            companyId={user?.id || ''}
                            labelInput="Avatar"
                            imageBucket="avatar"
                            desciption="Sube tu avatar"
                            style={{ width: '300px' }}
                            onImageChange={handleAvatarUpdate}
                            inputStyle={{ width: '150px' }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormProvider>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
