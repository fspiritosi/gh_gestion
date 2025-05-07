import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { useState } from 'react';

function CostCenterTable({
  costCenters,
  onEdit,
}: {
  costCenters: CostCenter[];
  onEdit: (costCenter: CostCenter) => void;
}) {
  const [filteredData, setFilteredData] = useState<CostCenter[]>([]);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Centros de Costo</h2>
        <VerActivosButton data={costCenters} filterKey="is_active" onFilteredChange={setFilteredData} />
      </div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData?.length > 0 ? (
              filteredData.map((costCenter) => (
                <TableRow key={costCenter.id}>
                  <TableCell className="font-medium">{costCenter.name}</TableCell>
                  <TableCell>
                    <Badge variant={costCenter.is_active ? 'success' : 'default'}>
                      {costCenter.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="link" className="hover:text-blue-400" onClick={() => onEdit(costCenter)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No hay tipos de centro de costos disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default CostCenterTable;
