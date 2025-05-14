import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createFilterOptions } from '@/features/Employees/Empleados/components/utils/utils';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { BaseDataTable } from '@/shared/components/data-table/base/data-table';
import { DataTableColumnHeader } from '@/shared/components/data-table/base/data-table-column-header';
import { ColumnDef, VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';
import { fetchAllHierarchicalPositions, fetchAllPositions } from '../../../actions/actions';

interface Position {
  id: string;
  created_at: string;
  name: string;
  hierarchical_position_id: string;
  is_active: boolean;
}
interface PositionsTableProps {
  positions: Awaited<ReturnType<typeof fetchAllPositions>>;
  hierarchicalPositions: Awaited<ReturnType<typeof fetchAllHierarchicalPositions>>;
  setSelectedPosition: (position: PositionsTableProps['positions'][number] | null) => void;
  setMode: (mode: 'create' | 'edit') => void;
  mode: 'create' | 'edit';
  savedVisibility: VisibilityState;
}

export function getPositionsColumns(
  onEdit: (position: PositionsTableProps['positions'][number]) => void
): ColumnDef<PositionsTableProps['positions'][number]>[] {
  return [
    {
      accessorKey: 'name',
      id: 'Nombre',
      // header: () => <span className="w-[200px]">Nombre</span>,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    // {
    //   accessorKey: 'hierarchical_position_id',
    //   id: 'Posición jerarquica',
    //   header: ({ column }) => <DataTableColumnHeader column={column} title="Posición jerarquica" />,
    //   filterFn: (row, id, value) => {
    //     return value.includes(row.getValue(id));
    //   },
    // },
    {
      accessorKey: 'hierarchical_position_id',
      id: 'Posición jerarquica',
      header: 'Posición jerarquica',
      cell: ({ row }) => {
        const provinces: string[] = row.original.hierarchical_position_id || [];
        if (!provinces || provinces.length === 0) return null;
        const [first, ...rest] = provinces;
        if (rest.length === 0) {
          return <Badge variant="default">{first}</Badge>;
        }
        return (
          <>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="default" className="cursor-pointer select-none">
                    {first} +{rest.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-1">
                    {rest.map((prov) => (
                      <p key={prov}>{prov}</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        );
      },
      filterFn: (row, id, value) => {
        const rowValues = row.getValue(id) || [];
        // Aseguramos que ambos sean arrays
        if (!Array.isArray(rowValues) || !Array.isArray(value)) return false;
        // ¿Algún elemento de value está en rowValues?
        return value.some((val) => rowValues.includes(val));
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

function PositionsTable({
  positions,
  hierarchicalPositions,
  setSelectedPosition,
  setMode,
  mode,
  savedVisibility,
}: PositionsTableProps) {
  const [filteredData, setFilteredData] = useState<PositionsTableProps['positions']>(
    positions.filter((p) => p.is_active)
  );
  const handleEdit = (position: PositionsTableProps['positions'][number]) => {
    setSelectedPosition(position);
    setMode('edit');
  };

  const formattedData = positions.map((position) => ({
    ...position,
    hierarchical_position_id: position?.hierarchical_position_id?.map(
      (h) => hierarchicalPositions.find((hp) => hp.id === h)?.name
    ),
  }));

  const allPositions = positions
    .flatMap((position) =>
      position?.hierarchical_position_id?.map((h) => hierarchicalPositions.find((hp) => hp.id === h)?.name)
    )
    .filter(Boolean);

  const name = createFilterOptions(positions, (position) => position.name);
  const positionsOptions = createFilterOptions(allPositions, (name) => name);

  // console.log(formattedData);

  return (
    <div className="ml-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Posiciones</h2>
        <div className="flex justify-end">
          <VerActivosButton data={positions} filterKey="is_active" onFilteredChange={setFilteredData} />
        </div>
      </div>
      {/* <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nombre</TableHead>
            <TableHead>Posición jerarquica</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData?.length > 0 ? (
            filteredData.map((position) => (
              <TableRow key={position.id}>
                <TableCell className="font-medium">{position.name}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[200px] cursor-pointer">
                          <Badge>
                            {hierarchicalPositions.find((h) => h.id === position?.hierarchical_position_id?.[0])
                              ?.name || '-'}
                            {(position?.hierarchical_position_id?.length||0) > 1 &&
                              ` +${((position?.hierarchical_position_id?.length||0)) - 1}`}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col ">
                          {hierarchicalPositions
                            .filter((h) => position?.hierarchical_position_id?.includes(h.id))
                            .map((hierarchicalPosition) => (
                              <span key={hierarchicalPosition.id}>{hierarchicalPosition.name}</span>
                            ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge variant={position.is_active ? 'success' : 'default'}>
                    {position.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="link"
                    className="hover:text-blue-400"
                    onClick={() => {
                      setMode('edit'), setSelectedPosition(position);
                    }}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No hay tipos de Posiciones {mode === 'create' ? 'activos' : 'inactivos'} disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table> */}

      <BaseDataTable
        className="mt-4"
        columns={getPositionsColumns(handleEdit)}
        data={formattedData as any}
        savedVisibility={savedVisibility}
        tableId="positions-table"
        toolbarOptions={{
          filterableColumns: [
            {
              columnId: 'Nombre',
              title: 'Nombre',
              options: name,
            },
            {
              columnId: 'Posición jerarquica',
              title: 'Posición jerarquica',
              options: positionsOptions,
            },
          ],
        }}
      />
    </div>
  );
}

export default PositionsTable;
