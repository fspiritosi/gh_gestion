'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { CustomerForm } from './CustomerForm';

interface Customer {
  id: string;
  name: string;
  cuit: number;
  client_email: string | null;
  client_phone: number | null;
  address: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at?: string | null;
  company_id: string;
  reason_for_termination?: string | null;
  termination_date?: string | null;
}

interface CustomerTableProps {
  customers: Customer[];
  company_id: string;
  id?: string;
}

export function CustomerTable({ customers, company_id, id }: CustomerTableProps) {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleOpen = () => {
    setEditingCustomer(null);
    setOpen(true);
  };

  const handleOpenDetail = (customer: Customer) => {
    setEditingCustomer(customer);
    setOpenDetail(true);
    setIsEditing(false); // Resetear el modo de edición al abrir un nuevo detalle
  };

  return (
    <div>
      {id !== undefined && (
        <div>
          <CustomerForm
            customer={editingCustomer}
            company_id={company_id}
            onSuccess={() => {
              setOpen(false);
              setOpenDetail(false);
            }}
          />
        </div>
      )}

      {id === undefined && (
        <div>
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setEditingCustomer(null);
              }
              setOpen(isOpen);
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="gh_orange" className="mb-4" onClick={handleOpen}>
                Registrar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl space-y-6">
              <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Registrar Cliente'}</DialogTitle>
              <CustomerForm
                customer={editingCustomer}
                company_id={company_id}
                onSuccess={() => {
                  setOpen(false);
                  setOpenDetail(false);
                }}
              />
            </DialogContent>
          </Dialog>

          {openDetail && editingCustomer ? (
            <div>
              <Tabs defaultValue="detail">
                <div className="flex justify-between items-center mr-3">
                  <TabsList className="flex gap-1 bg-gh_contrast/50">
                    <TabsTrigger value="detail" className="text-gh_orange font-semibold">
                      Detalle
                    </TabsTrigger>
                    <TabsTrigger value="services" className="text-gh_orange font-semibold">
                      Servicios
                    </TabsTrigger>
                  </TabsList>
                  <Button variant="outline" onClick={() => setOpenDetail(false)}>
                    Cerrar
                  </Button>
                </div>

                <TabsContent value="detail">
                  <Card className="mt-4">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Información del Cliente</h2>
                        {!isEditing && (
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="bg-gh_orange/10 text-gh_orange hover:bg-gh_orange/20 border-gh_orange/50"
                          >
                            Habilitar edición
                          </Button>
                        )}
                      </div>

                      <CustomerForm
                        customer={editingCustomer}
                        company_id={editingCustomer.company_id}
                        readOnly={!isEditing}
                        onSuccess={() => {
                          setIsEditing(false);
                          setOpenDetail(false);
                          // Aquí podrías querer actualizar la lista de clientes
                        }}
                      />

                      {/* <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                        <p>Creado: {format(new Date(editingCustomer.created_at), 'dd/MM/yyyy')}</p>
                        <p>Última actualización: {editingCustomer.updated_at ? format(new Date(editingCustomer.updated_at), 'dd/MM/yyyy') : 'No disponible'}</p>
                      </div> */}
                    </div>
                  </Card>
                </TabsContent>
                <TabsContent value="services">
                  <Card className="mt-4">
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-4">Servicios del Cliente</h3>
                      {/* Aquí iría la lista de servicios del cliente */}
                      <p className="text-muted-foreground">Próximamente: Lista de servicios del cliente</p>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card>
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>CUIT</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers?.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleOpenDetail(customer)}
                      >
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.cuit}</TableCell>
                        <TableCell>{customer.client_email || '-'}</TableCell>
                        <TableCell>{customer.client_phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={customer.is_active ? 'success' : 'destructive'}>
                            {customer.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
