import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createFilterOptions } from '@/features/Employees/Empleados/components/utils/utils';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { BaseDataTable } from '@/shared/components/data-table/base/data-table';
import { DataTableColumnHeader } from '@/shared/components/data-table/base/data-table-column-header';
import { ColumnDef, VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';

interface Sector {
  id: string;
  name: string;
  is_active: boolean;
}

export function getOrganigramColumns(onEdit: (sector: Sector) => void): ColumnDef<Sector>[] {
  return [
    {
      accessorKey: 'name',
      id: 'Nombre',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'is_active',
      id: 'Estado',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'default'}>
          {row.original.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button size="sm" variant="link" className="hover:text-blue-400" onClick={() => onEdit(row.original)}>
          Editar
        </Button>
      ),
      enableSorting: false,
    },
  ];
}

export function OrganigramTable({
  sectors,
  onEdit,
  savedVisibility,
}: {
  sectors: Sector[];
  onEdit: (sector: Sector) => void;
  savedVisibility: VisibilityState;
}) {
  const [filteredData, setFilteredData] = useState<Sector[]>(sectors);

  const names = createFilterOptions(filteredData, (sector) => sector.name);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Sectores</h2>
        <VerActivosButton data={sectors} filterKey="is_active" onFilteredChange={setFilteredData} />
      </div>
      <div className="">
        <BaseDataTable
          savedVisibility={savedVisibility}
          columns={getOrganigramColumns(onEdit)}
          data={filteredData}
          tableId="organigram-table"
          toolbarOptions={{
            filterableColumns: [
              {
                columnId: 'Nombre',
                title: 'Nombre',
                options: names,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

export default OrganigramTable;
