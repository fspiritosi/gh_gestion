'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { VerActivosButton } from './rrhh/verActivosButton';
interface ContractTypeTableProps {
  contractTypes: ContractType[];
  onEdit: (contractType: ContractType) => void;
}

export default function ContractTypeTable({ contractTypes, onEdit }: ContractTypeTableProps) {
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [filteredContractTypes, setFilteredContractTypes] = useState<ContractType[]>([]);

  useEffect(() => {
    filterContractTypes();
  }, [isActiveFilter, contractTypes]);

  const filterContractTypes = () => {
    const filtered = contractTypes.filter((contractType) => contractType.is_active === isActiveFilter);
    setFilteredContractTypes(filtered);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Tipos de Contrato</h2>
        <VerActivosButton data={contractTypes} filterKey="is_active" onFilteredChange={setFilteredContractTypes} />
      </div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContractTypes.length > 0 ? (
              filteredContractTypes.map((contractType) => (
                <TableRow key={contractType.id}>
                  <TableCell className="font-medium">{contractType.name}</TableCell>
                  <TableCell>{contractType.description}</TableCell>
                  <TableCell>
                    <Badge variant={contractType.is_active ? 'success' : 'default'}>
                      {contractType.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="link"
                      className="hover:text-blue-400"
                      onClick={() => onEdit(contractType)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No hay tipos de contrato {isActiveFilter ? 'activos' : 'inactivos'} disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
