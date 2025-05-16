import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { useState } from 'react';

import { Position } from '@/types/types';
interface PositionsTableProps {
  positions: (Position & { aptitudes?: any[] })[];
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
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Puestos</TableHead>
            <TableHead>Aptitudes</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData?.length > 0 ? (
            filteredData.map((position) => (
              <TableRow key={position.id}>
                <TableCell>{position.name}</TableCell>
                <TableCell>
                  <Badge variant={position.is_active ? 'success' : 'destructive'}>
                    {position.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[200px] cursor-pointer">
                          <Badge>
                            {(() => {
                              const firstPositionId = position.hierarchical_position_id?.[0];
                              const firstPosition = firstPositionId
                                ? hierarchicalPositions.find((h: any) => h.id === firstPositionId)?.name
                                : '-';
                              const additionalPositions =
                                position.hierarchical_position_id?.length &&
                                position.hierarchical_position_id.length > 1
                                  ? ` +${position.hierarchical_position_id.length - 1}`
                                  : '';
                              return `${firstPosition}${additionalPositions}`;
                            })()}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col gap-1">
                          {position.hierarchical_position_id?.map((id, index) => (
                            <span key={`${id}-${index}`}>
                              {hierarchicalPositions.find((h: any) => h.id === id)?.name || '-'}
                            </span>
                          )) || <span>-</span>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[200px] cursor-pointer">
                          <Badge>
                            {position.aptitudes?.[0]?.nombre || 'No hay aptitudes asignadas'}
                            {position.aptitudes?.length &&
                              position.aptitudes.length > 1 &&
                              ` +${position.aptitudes.length - 1}`}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col gap-1">
                          {position.aptitudes?.map((aptitude: any, index: number) => (
                            <span key={`${aptitude.id}-${index}`}>{aptitude.nombre}</span>
                          )) || <span>No hay aptitudes asignadas</span>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
