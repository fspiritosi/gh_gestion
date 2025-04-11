'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Definir la interfaz para los datos del diagrama
export interface Diagram {
  id: string;
  name: string;
  is_active: boolean;
  active_working_days: number;
  inactive_working_days: number;
  active_novelty: string | null;
  inactive_novelty: string | null;
  createdAt: Date;
}

export const columns = (
  onView: (diagram: Diagram) => void,
  onEdit: (diagram: Diagram) => void,
  onToggleStatus: (diagramId: string, newStatus: boolean) => void
): ColumnDef<Diagram>[] => [
  // {
  //   id: 'actions',
  //   header: 'Acciones',
  //   cell: ({ row }) => {
  //     const diagram = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Abrir menú</span>
  //             <MoreVertical className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="start">
  //           <DropdownMenuLabel>Opciones</DropdownMenuLabel>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem onClick={() => onView(diagram)}>
  //             <Button variant="ghost" size="lg" className="flex items-center">
  //               Ver Diagrama
  //             </Button>
  //           </DropdownMenuItem>
  //           <DropdownMenuItem onClick={() => onEdit(diagram)}>
  //             <Button variant="ghost" size="lg" className="flex items-center">
  //               Editar Diagrama
  //             </Button>
  //           </DropdownMenuItem>
  //           <DropdownMenuItem onClick={() => onToggleStatus(diagram.id, !diagram.is_active)}>
  //             <Button variant="destructive" size="lg" className="flex items-center justify-center">
  //               {diagram.is_active ? 'Dar de baja' : 'Dar de alta'}
  //             </Button>
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'is_active',
    header: 'Estado',
    cell: ({ row }) => (
      <div>
        {row.getValue('is_active') ? (
          <Badge className="bg-green-500">Activo</Badge>
        ) : (
          <Badge variant="outline">Inactivo</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'active_working_days',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Días Activos
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('active_working_days')}</div>,
  },
  {
    accessorKey: 'active_novelty',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Novedad Activa
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('active_novelty')}</div>,
  },
  {
    accessorKey: 'inactive_working_days',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Días Inactivos
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('inactive_working_days')}</div>,
  },
  {
    accessorKey: 'inactive_novelty',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Novedad Inactiva
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('inactive_novelty')}</div>,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Fecha Creación
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue('created_at') as Date;
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    id: 'edit',
    header: 'Editar',
    cell: ({ row }) => {
      const diagram = row.original;

      return (
        <Button onClick={() => onEdit(diagram)} variant="link" size="lg" className="flex items-center">
          Editar
        </Button>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
