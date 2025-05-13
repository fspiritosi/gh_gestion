'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import * as React from 'react';
import { DataTableViewOptions } from '../base/data-table-view-options';
import { DataTableFacetedFilter } from '../filters/data-table-faceted-filter';

interface FilterableColumn<TData> {
  columnId: string;
  title: string;
  options?: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface SearchableColumn {
  columnId: string;
  placeholder?: string;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterableColumns?: FilterableColumn<TData>[];
  searchableColumns?: SearchableColumn[];
  showViewOptions?: boolean;
  extraActions?: React.ReactNode;
  tableId?: string; // Añadimos tableId para persistencia
}

export function DataTableToolbarBase<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
  showViewOptions = true,
  extraActions,
  tableId, // Recibimos tableId
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const columnVisibility = table.getState().columnVisibility;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2 flex-wrap">
        {searchableColumns.length > 0 &&
          searchableColumns.map((column) => {
            const tableColumn = table.getColumn(column.columnId);
            // Solo mostrar el campo de búsqueda si la columna está visible
            return tableColumn && columnVisibility[column.columnId] !== false ? (
              <Input
                key={column.columnId}
                placeholder={column.placeholder || `Buscar...`}
                value={(tableColumn.getFilterValue() as string) ?? ''}
                onChange={(event) => tableColumn.setFilterValue(event.target.value)}
                className="h-8 w-[150px] lg:w-[250px]"
              />
            ) : null;
          })}

        {filterableColumns.length > 0 &&
          filterableColumns.map((column) => {
            const tableColumn = table.getColumn(column.columnId);
            // Solo mostrar el filtro si la columna está visible
            return tableColumn && columnVisibility[column.columnId] !== false ? (
              <DataTableFacetedFilter
                key={column.columnId}
                column={tableColumn}
                title={column.title}
                options={column.options || []}
              />
            ) : null;
          })}

        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            Limpiar filtros
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2 flex-wrap">
        {extraActions}
        {showViewOptions && <DataTableViewOptions table={table} tableId={tableId} />}
      </div>
    </div>
  );
}
