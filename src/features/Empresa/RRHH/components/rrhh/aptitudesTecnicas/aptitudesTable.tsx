'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { useState } from 'react';
import { AptitudTecnica } from '../actions/aptitudesTecnicas';

interface AptitudesTableProps {
  aptitudes: AptitudTecnica[];
  onEdit: (aptitud: AptitudTecnica) => void;
}

export function AptitudesTable({ aptitudes, onEdit }: AptitudesTableProps) {
  const [filteredData, setFilteredData] = useState<AptitudTecnica[]>(aptitudes);

  console.log(aptitudes, 'aptitudes');
  return (
    <div className="p-2 w-full">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Aptitudes</h2>
        <div className="flex justify-end">
          <VerActivosButton data={aptitudes} filterKey="is_active" onFilteredChange={setFilteredData} />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Puestos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((aptitud) => (
            <TableRow key={aptitud.id}>
              <TableCell className="font-medium">{aptitud.nombre}</TableCell>
              <TableCell>
                {aptitud.aptitudes_tecnicas_puestos?.length > 0 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[200px] cursor-pointer">
                          <Badge>
                            {aptitud.aptitudes_tecnicas_puestos[0]?.puesto_id?.name}
                            {aptitud.aptitudes_tecnicas_puestos.length > 1 &&
                              ` +${aptitud.aptitudes_tecnicas_puestos.length - 1}`}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col gap-1" key={aptitud.id}>
                          {aptitud.aptitudes_tecnicas_puestos.map((puesto, index) => (
                            <span key={`${puesto.puesto_id?.id || 'puesto'}-${index}`}>{puesto.puesto_id?.name}</span>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  'Sin puestos asignados'
                )}
              </TableCell>
              <TableCell>
                <Badge variant={aptitud.is_active ? 'success' : 'destructive'}>
                  {aptitud.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" onClick={() => onEdit(aptitud)}>
                    Editar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
