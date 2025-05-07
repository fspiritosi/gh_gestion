'use client';
import { Badge } from '@/components/ui/badge';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';
interface AreaTableProp {
  areas: {
    id: string;
    nombre: string;
    descripcion_corta: string;
    cliente: string;
    provincias: string[];
  }[];
  selectedArea: AreaTableProp['areas'][number] | null;
  setSelectedArea: (area: AreaTableProp['areas'][number] | null) => void;
  setMode: (mode: 'create' | 'edit') => void;
  mode: 'create' | 'edit';
}

function AreaTable({ areas, selectedArea, setSelectedArea, setMode, mode }: AreaTableProp) {
  // Estados para filtros y paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterByName, setFilterByName] = useState('');
  const [selectedClient, setSelectedClient] = useState('todos');
  const [selectedProvince, setSelectedProvince] = useState('todos');
  const [filteredAreas, setFilteredAreas] = useState(areas);

  // Obtener valores únicos para los selects
  const uniqueClients = Array.from(new Set(areas.map((area) => area.cliente)));

  // Obtener provincias únicas de las áreas originales
  const uniqueProvinces = Array.from(new Set(areas.flatMap((area) => area.provincias))).sort();

  // Aplicar filtros
  useEffect(() => {
    let result = [...areas];
    // Filtro por nombre
    if (filterByName) {
      const searchTerm = filterByName.toLowerCase();
      result = result.filter((area) => area.nombre.toLowerCase().includes(searchTerm));
    }

    // Filtro por cliente
    if (selectedClient !== 'todos') {
      result = result.filter((area) => area.cliente === selectedClient);
    }

    // Filtro por provincia
    if (selectedProvince !== 'todos') {
      result = result.filter((area) => area.provincias.includes(selectedProvince));
    }

    setFilteredAreas(result);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  }, [areas, filterByName, selectedClient, selectedProvince]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredAreas?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAreas.slice(startIndex, endIndex);

  const handleEdit = (area: AreaTableProp['areas'][number]) => {
    setSelectedArea(area);
    setMode('edit');
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="ml-4 space-y-4">
      <h2 className="text-xl font-bold">Areas</h2>

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
                <SelectItem key={cliente} value={cliente}>
                  {cliente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por provincia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las provincias</SelectItem>
              {uniqueProvinces.map((provincia) => (
                <SelectItem key={provincia} value={provincia}>
                  {provincia}
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
              <TableHead>Provincias</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems?.length > 0 ? (
              currentItems.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.nombre}</TableCell>
                  <TableCell>{area.cliente}</TableCell>
                  <TableCell>{area.descripcion_corta}</TableCell>
                  {/* <TableCell>{area.provincias.join(', ')}</TableCell> */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate max-w-[200px] cursor-pointer">
                            <Badge>
                              {area.provincias[0]}
                              {area.provincias?.length > 1 && ` +${area.provincias?.length - 1}`}
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex flex-col ">
                            {area.provincias.map((provincia) => (
                              <span key={provincia}>{provincia}</span>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  <TableCell>
                    <Button
                      onClick={() => handleEdit(area)}
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
      {filteredAreas?.length > itemsPerPage && (
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

export default AreaTable;
