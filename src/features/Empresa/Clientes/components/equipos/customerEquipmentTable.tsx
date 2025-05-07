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

interface CustomerEquipmentTableProp {
  customerEquipments: {
    id: string;
    name: string;
    type: string;
    customer_id: string;
  }[];
  customers: any[];
  selectedCustomerEquipment: CustomerEquipmentTableProp['customerEquipments'][number] | null;
  setSelectedCustomerEquipment: (
    customerEquipment: CustomerEquipmentTableProp['customerEquipments'][number] | null
  ) => void;
  setMode: (mode: 'create' | 'edit') => void;
  mode: 'create' | 'edit';
}

function CustomerEquipmentTable({
  customers,
  customerEquipments,
  selectedCustomerEquipment,
  setSelectedCustomerEquipment,
  setMode,
  mode,
}: CustomerEquipmentTableProp) {
  // Estados para filtros y paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterByName, setFilterByName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('todos');
  const [selectedTypes, setSelectedTypes] = useState('todos');
  const [filteredCustomerEquipments, setFilteredCustomerEquipments] = useState(customerEquipments);

  // Obtener valores únicos para los selects
  const uniqueCustomers = Array.from(
    new Set(customerEquipments.map((customerEquipment) => customerEquipment.customer_id))
  ).map((id) => {
    const customer = customers.find((customer) => customer.id === id);
    return {
      id,
      name: customer?.name,
    };
  });

  console.log(uniqueCustomers);
  const uniqueTypes = Array.from(
    new Set(customerEquipments.flatMap((customerEquipment) => [customerEquipment.type]))
  ).sort();
  console.log(customers);
  console.log(customerEquipments);
  // Aplicar filtros
  useEffect(() => {
    let result = [...customerEquipments];
    // Filtro por nombre
    if (filterByName) {
      const searchTerm = filterByName.toLowerCase();
      result = result.filter((customerEquipment) => customerEquipment.name.toLowerCase().includes(searchTerm));
    }

    // Filtro por cliente
    if (selectedCustomer !== 'todos') {
      result = result.filter((customerEquipment) => customerEquipment.customer_id === selectedCustomer);
    }
    if (selectedTypes !== 'todos') {
      result = result.filter((customerEquipment) => customerEquipment.type === selectedTypes);
    }
    setFilteredCustomerEquipments(result);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  }, [customerEquipments, filterByName, selectedCustomer, selectedTypes]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredCustomerEquipments?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  console.log(customers);
  const currentItems = filteredCustomerEquipments.slice(startIndex, endIndex).map((customerEquipment) => {
    const customer = customers?.find((customer: any) => customer.id === customerEquipment.customer_id);
    return {
      ...customerEquipment,
      customer_name: customer ? customer.name : '',
    };
  });
  console.log(currentItems);
  const handleEdit = (customerEquipment: CustomerEquipmentTableProp['customerEquipments'][number]) => {
    setSelectedCustomerEquipment(customerEquipment);
    setMode('edit');
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  console.log(customerEquipments);
  return (
    <div className="ml-4 space-y-4">
      <h2 className="text-xl font-bold">Equipos del cliente</h2>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="search"
          placeholder="Buscar por serial"
          value={filterByName}
          onChange={(e) => setFilterByName(e.target.value)}
          className="w-[200px]"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <Select value={selectedCustomer} key={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los clientes</SelectItem>
              {uniqueCustomers.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTypes} onValueChange={setSelectedTypes}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Tipos de equipo</SelectItem>
              {uniqueTypes.map((tipos) => (
                <SelectItem key={tipos} value={tipos}>
                  {tipos}
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
              <TableHead>Nombre del equipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo de equipo</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems?.length > 0 ? (
              currentItems.map((customerEquipment) => (
                <TableRow key={customerEquipment.id}>
                  <TableCell className="font-medium">{customerEquipment.name}</TableCell>
                  <TableCell>{customerEquipment.customer_name}</TableCell>
                  <TableCell>{customerEquipment.type}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleEdit(customerEquipment)}
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
                <TableCell colSpan={7} className="text-center py-4">
                  No hay equipos disponibles con los filtros seleccionados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {filteredCustomerEquipments?.length > itemsPerPage && (
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

export default CustomerEquipmentTable;
