'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTableToolbarBase } from '../toolbars/data-table-toolbar-base';
import { DataTablePagination } from './data-table-pagination';

// Tipos para el toolbar
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

interface ToolbarOptions<TData> {
  filterableColumns?: FilterableColumn<TData>[];
  searchableColumns?: SearchableColumn[];
  showViewOptions?: boolean;
  extraActions?: React.ReactNode;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  toolbarOptions?: ToolbarOptions<TData>;
  paginationComponent?: React.ReactNode;
  className?: string;
  tableId?: string; // ID para persistencia
  initialColumnVisibility?: VisibilityState; // Estado inicial de columnas
}

// Función para obtener la visibilidad guardada
function getSavedVisibility(tableId: string): VisibilityState | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(`table-columns-${tableId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error al leer la configuración guardada:', e);
    return null;
  }
}

export function BaseDataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  toolbarOptions,
  paginationComponent,
  className = '',
  tableId,
  initialColumnVisibility,
}: DataTableProps<TData, TValue>) {
  // Intentar cargar la visibilidad guardada antes del renderizado inicial si hay tableId
  const savedVisibility = tableId ? getSavedVisibility(tableId) : null;

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Usar la visibilidad guardada, o la inicial si se proporciona, o un objeto vacío
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    savedVisibility || initialColumnVisibility || {}
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: (visibility) => {
      setColumnVisibility(visibility);

      // Guardar las preferencias en localStorage cuando cambian
      if (tableId && typeof window !== 'undefined') {
        localStorage.setItem(`table-columns-${tableId}`, JSON.stringify(visibility));
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {toolbarOptions && (
        <DataTableToolbarBase
          table={table}
          filterableColumns={toolbarOptions.filterableColumns}
          searchableColumns={toolbarOptions.searchableColumns}
          showViewOptions={toolbarOptions.showViewOptions}
          extraActions={toolbarOptions.extraActions}
          tableId={tableId}
        />
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={onRowClick ? 'hover:cursor-pointer' : ''}
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns?.length} className="h-24 text-center">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {paginationComponent ? (
        React.cloneElement(paginationComponent as React.ReactElement, { table })
      ) : (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}
