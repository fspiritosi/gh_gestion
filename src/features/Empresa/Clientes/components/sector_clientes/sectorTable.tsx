'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';

interface Sector {
  id: string;
  name: string;
  descripcion_corta: string;
  customer_id: string;
  sector_customer: Array<{
    customer_id: {
      id: string;
      name: string;
    };
  }>;
}
interface SectorTableProp {
  customers: any[];
  sectors: Sector[];
  selectedSector: Sector | null;
  setSelectedSector: (sector: Sector | null) => void;
  setMode: (mode: 'create' | 'edit') => void;
  mode: 'create' | 'edit';
}

function SectorTable({ customers, sectors, selectedSector, setSelectedSector, setMode, mode }: SectorTableProp) {
  // Estados para filtros y paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterByName, setFilterByName] = useState('');
  const [selectedClient, setSelectedClient] = useState('todos');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState('todos');
  const [filteredSectors, setFilteredSectors] = useState(sectors);
  console.log(sectors);
  // Obtener valores únicos para los selects
  const uniqueClients = [
    ...new Map(
      sectors.flatMap((sector) => sector.sector_customer.map((c) => c.customer_id)).map((client) => [client.id, client])
    ).values(),
  ];

  console.log(uniqueClients);
  // Obtener sectores únicos de las áreas originales
  const uniqueSectors = Array.from(new Set(sectors.map((sector) => sector.name))).sort();

  // Aplicar filtros
  useEffect(() => {
    let result = [...sectors];
    // Filtro por nombre
    if (filterByName) {
      const searchTerm = filterByName.toLowerCase();
      result = result.filter((sector) => sector.name.toLowerCase().includes(searchTerm));
    }

    // Filtro por cliente
    if (selectedClient !== 'todos') {
      result = result.filter((sector) => sector.sector_customer[0].customer_id.name === selectedClient);
    }

    // Filtro por sector
    if (selectedSectorFilter !== 'todos') {
      result = result.filter((sector) => sector.name === selectedSectorFilter);
    }

    setFilteredSectors(result);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  }, [sectors, filterByName, selectedClient, selectedSectorFilter]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredSectors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredSectors.slice(startIndex, endIndex).map((sector) => {
    const customer = customers.find((customer) => customer.id === sector.customer_id);
    return { ...sector, customer_name: customer?.name };
  });
  console.log(currentItems);
  const handleEdit = (sector: Sector) => {
    setSelectedSector(sector);
    setMode('edit');
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  return (
    <div className="ml-4 space-y-4">
      <h2 className="text-xl font-bold">Sectores</h2>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="search"
          placeholder="Buscar por nombre"
          value={filterByName}
          onChange={(e) => setFilterByName(e.target.value)}
          className="w-[200px]"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los clientes</SelectItem>
              {uniqueClients.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.name}>
                  {cliente.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSectorFilter} onValueChange={setSelectedSectorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los sectores</SelectItem>
              {uniqueSectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell>{sector.sector_customer[0]?.customer_id.name}</TableCell>
                  <TableCell>{sector.descripcion_corta}</TableCell>

                  <TableCell>
                    <Button
                      onClick={() => handleEdit(sector)}
                      size="sm"
                      variant="ghost"
                      //   className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No hay áreas disponibles con los filtros seleccionados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {filteredSectors.length > itemsPerPage && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default SectorTable;
