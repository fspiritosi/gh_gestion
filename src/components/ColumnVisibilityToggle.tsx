import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table } from '@tanstack/react-table';
import { useEffect, useRef } from 'react';

interface ColumnVisibilityToggleProps<TData> {
  table: Table<TData>;
}

export function ColumnVisibilityToggle<TData>({ table }: ColumnVisibilityToggleProps<TData>) {
  const allColumns = table.getAllColumns().filter((col) => col.getCanHide());
  const visibleColumns = allColumns.filter((col) => col.getIsVisible());
  const allSelected = visibleColumns.length === allColumns.length;
  const someSelected = visibleColumns.length > 0 && !allSelected;

  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = (value: boolean) => {
    allColumns.forEach((col) => {
      col.toggleVisibility(value);
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Columnas</Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 max-h-[50dvh] overflow-y-auto"
        align="end"
        side="bottom"
        sideOffset={4}
        avoidCollisions
        collisionPadding={10}
      >
        {/* Seleccionar todos */}
        <div className="flex items-center gap-2 py-1 border-b pb-2 mb-2">
          <Checkbox
            id="select-all"
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            onCheckedChange={(value) => toggleAll(!!value)}
          />

          <Label htmlFor="select-all" className="font-semibold">
            Seleccionar todos
          </Label>
        </div>

        {/* Columnas individuales */}
        {allColumns.map((column) => {
          if (
            column.id === 'actions' ||
            column.id === 'showUnavaliableEmployees' ||
            typeof column.columnDef.header !== 'string'
          ) {
            return null;
          }

          return (
            <div key={column.id} className="flex items-center gap-2 py-1">
              <Checkbox
                id={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              />
              <Label htmlFor={column.id} className="capitalize">
                {column.columnDef.header}
              </Label>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
