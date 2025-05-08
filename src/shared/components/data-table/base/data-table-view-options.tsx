'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table } from '@tanstack/react-table';
import { SlidersHorizontal } from 'lucide-react';
import { useEffect } from 'react';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  tableId?: string; // ID opcional para guardar estado en localStorage
}

export function DataTableViewOptions<TData>({ table, tableId }: DataTableViewOptionsProps<TData>) {
  // Función para guardar el estado de visibilidad en localStorage
  const saveVisibilityState = () => {
    if (!tableId) return;

    const columnVisibility = table.getState().columnVisibility;
    localStorage.setItem(`table-columns-${tableId}`, JSON.stringify(columnVisibility));
  };

  // Cargar el estado de visibilidad desde localStorage al montar el componente
  useEffect(() => {
    if (!tableId) return;

    try {
      const savedVisibility = localStorage.getItem(`table-columns-${tableId}`);
      if (savedVisibility) {
        const parsedVisibility = JSON.parse(savedVisibility);
        table.setColumnVisibility(parsedVisibility);
      }
    } catch (error) {
      console.error('Error al cargar el estado de visibilidad de columnas:', error);
    }
  }, [table, tableId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Columnas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => {
                  column.toggleVisibility(!!value);
                  // Guardar cambios cuando se modifica la visibilidad
                  if (tableId) {
                    setTimeout(saveVisibilityState, 0);
                  }
                }}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
