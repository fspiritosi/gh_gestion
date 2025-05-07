import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { useState } from 'react';
interface Position {
  id: string;
  created_at: string;
  name: string;
  hierarchical_position_id: string;
  is_active: boolean;
}
interface PositionsTableProps {
  positions: Position[];
  hierarchicalPositions: any[];
  selectedPosition: Position | null;
  setSelectedPosition: (position: Position | null) => void;
  setMode: (mode: 'create' | 'edit') => void;
  mode: 'create' | 'edit';
}

function PositionsTable({
  positions,
  hierarchicalPositions,
  selectedPosition,
  setSelectedPosition,
  setMode,
  mode,
}: PositionsTableProps) {
  const [filteredData, setFilteredData] = useState<Position[]>([]);

  return (
    <div className="ml-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Posiciones</h2>
        <div className="flex justify-end">
          <VerActivosButton data={positions} filterKey="is_active" onFilteredChange={setFilteredData} />
        </div>
      </div>
      <Table>
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
                  {(Array.isArray(position.hierarchical_position_id)
                    ? position.hierarchical_position_id
                    : [position.hierarchical_position_id]
                  )
                    .map((id: string) => hierarchicalPositions.find((h: any) => h.id === id)?.name || '-')
                    .join(', ') || '-'}
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
      </Table>
    </div>
  );
}

export default PositionsTable;
