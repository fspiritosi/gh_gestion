'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';
import { Card, CardDescription } from '@/components/ui/card';
import { DownloadIcon } from 'lucide-react';

export function PermanentDocumentsDownloadButton({ table }: { table: any }) {
  // Aquí puedes personalizar la lógica de descarga si lo necesitas
  const handleDownloadAll = () => {
    // Implementa aquí la lógica de descarga para documentos permanentes
    // Por ejemplo: exportar a Excel, PDF, o descargar archivos
    alert('Descarga de documentos no implementada');
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={
            table.getFilteredRowModel().rows.filter((row: any) => row.original.state !== 'pendiente')?.length === 0
          }
          className="ml-6"
          size="sm"
          variant={'outline'}
        >
          <DownloadIcon className="size-4 mr-2" />
          Descargar Documentos
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Estas a punto de descargar{' '}
            {table.getFilteredRowModel().rows.filter((row: any) => row.original.state !== 'pendiente')?.length}{' '}
            documentos
          </AlertDialogTitle>
          <AlertDialogDescription className="max-h-[65vh] overflow-y-auto">
            {table.getFilteredRowModel().rows.filter((row: any) => row.original.state === 'pendiente')?.length > 0 && (
              <div>
                <CardDescription className="underline">
                  Alerta: Hay documentos que estan pendientes y no se descargarán
                </CardDescription>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-red-600">
                      {
                        table.getFilteredRowModel().rows.filter((row: any) => row.original.state === 'pendiente')
                          ?.length
                      }{' '}
                      Documentos pendientes
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-2">
                        {table
                          .getFilteredRowModel()
                          .rows.filter((row: any) => row.original.state === 'pendiente')
                          .map((row: any) => (
                            <Card className="p-2 border-red-300" key={row.id}>
                              <CardDescription>
                                {(row.original as any).resource} ({(row.original as any).documentName})
                              </CardDescription>
                            </Card>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-green-600">
                  {' '}
                  {
                    table.getFilteredRowModel().rows.filter((row: any) => row.original.state !== 'pendiente')?.length
                  }{' '}
                  Documentos presentados
                </AccordionTrigger>
                <AccordionContent>
                  <div className=" flex flex-col gap-2 mt-2">
                    {table
                      .getFilteredRowModel()
                      .rows.filter((row: any) => row.original.state !== 'pendiente')
                      .map((row: any) => {
                        return (
                          <Card className="p-2 border-green-600" key={row.id}>
                            <CardDescription>
                              {(row.original as any).resource} ({(row.original as any).documentName})
                            </CardDescription>
                          </Card>
                        );
                      })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleDownloadAll();
            }}
          >
            Descargar documentos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
