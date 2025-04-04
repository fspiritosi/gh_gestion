'use client';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { useState } from 'react';

export default function CreateUser() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
        <CardHeader className="pb-3">
          <CardTitle>Usuarios</CardTitle>
          <CardDescription className="max-w-lg text-balance leading-relaxed">
            Crear nuevos usuarios que sean administradores de la plataforma de Grupo Horizonte
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog open={open} onOpenChange={() => setOpen(!open)}>
            <AlertDialogTrigger>
              <Button>Crear Usuario</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Crear nuevo usuario</AlertDialogTitle>
              <AlertDialogDescription>Aca va el formulario, ver de pasarlo a un componente</AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </>
  );
}
