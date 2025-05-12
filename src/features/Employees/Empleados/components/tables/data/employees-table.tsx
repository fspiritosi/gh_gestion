'use client';

import { BaseDataTable } from '@/shared/components/data-table/base/data-table';
import { VisibilityState } from '@tanstack/react-table';
import { BadgeCheck, Briefcase, Building, ClipboardSignature, CreditCard, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatEmployeesForTable } from '../../utils/utils';
import { employeeColumns } from './columns';
import { EmployeeTableData } from './types';

interface EmployeesTableProps {
  onRowClick?: (employee: EmployeeTableData) => void;
  className?: string;
  employees?: ReturnType<typeof formatEmployeesForTable>;
  tableId?: string;
  savedVisibility?: VisibilityState;
}

// Función especial para propiedades anidadas complejas como las afectaciones
export const createNestedFilterOptions = <T extends any>(
  data: T[] | undefined,
  accessor: (item: T) => any[],
  icon: React.ComponentType<{ className?: string }>
) => {
  const uniqueValues = Array.from(
    new Set(
      data
        ?.map((item) => accessor(item))
        .flat()
        .filter(Boolean)
    )
  );

  return uniqueValues.map((value) => ({
    label: value || '',
    value: value || '',
    icon,
  }));
};

// Función utilitaria para crear opciones de filtro a partir de una propiedad simple
export const createFilterOptions = <T extends any>(
  data: T[] | undefined,
  accessor: (item: T) => any,
  icon: React.ComponentType<{ className?: string }>
) => {
  return Array.from(new Set(data?.map(accessor).filter(Boolean))).map((value) => ({
    label: value || '',
    value: value || '',
    icon,
  }));
};

export function EmployeesTableReusable({
  onRowClick,
  className,
  employees,
  tableId = 'employees-table',
  savedVisibility,
}: EmployeesTableProps) {
  const router = useRouter();

  // Generar todas las opciones de filtro utilizando las funciones utilitarias
  const positions = createFilterOptions(
    employees,
    (employee) => (employee?.hierarchical_position as any)?.name,
    Briefcase // Icono de maletín para cargos/posiciones
  );

  const afectacionesOpciones = createNestedFilterOptions(
    employees,
    (employee) =>
      (employee as any)?.contractor_employee
        ?.map((contractor: any) => contractor?.contractor_id?.name)
        .filter(Boolean) || [],
    Building // Icono de edificio para afectaciones/contratistas
  );

  const contractTypes = createFilterOptions(
    employees,
    (employee) => employee?.type_of_contract,
    ClipboardSignature // Icono de contrato/firma para tipos de contrato
  );

  const statuses = createFilterOptions(
    employees,
    (employee) => employee?.status,
    BadgeCheck // Icono de insignia para estados
  );

  const tiposDocumento = createFilterOptions(
    employees,
    (employee) => employee?.document_type,
    CreditCard // Icono de tarjeta para tipos de documento
  );

  const cuils = createFilterOptions(
    employees,
    (employee) => employee?.cuil,
    FileText // Icono de documento para números de CUIL
  );

  const nationality = createFilterOptions(
    employees,
    (employee) => employee?.nationality,
    FileText // Icono para nacionalidad
  );

  const gender = createFilterOptions(
    employees,
    (employee) => employee?.gender,
    FileText // Icono para género
  );

  const handleRowClick = (employee: EmployeeTableData) => {
    if (onRowClick) {
      onRowClick(employee);
    } else {
      router.push(`/dashboard/employee/action?action=view&employee_id=${employee.id}`);
    }
  };

  return (
    <BaseDataTable
      columns={employeeColumns as any}
      data={(employees as any) || []}
      onRowClick={handleRowClick}
      className={className}
      tableId={tableId}
      savedVisibility={savedVisibility}
      toolbarOptions={{
        filterableColumns: [
          {
            columnId: 'Estado',
            title: 'Estado',
            options: statuses,
          },
          {
            columnId: 'Cuil',
            title: 'Cuil',
            options: cuils,
          },
          {
            columnId: 'Tipo de Documento',
            title: 'Tipo de Documento',
            options: tiposDocumento,
          },
          {
            columnId: 'Cargo',
            title: 'Cargo',
            options: positions,
          },
          {
            columnId: 'Tipo de Contrato',
            title: 'Tipo de Contrato',
            options: contractTypes,
          },
          {
            columnId: 'Afectaciones',
            title: 'Afectaciones',
            options: afectacionesOpciones,
          },
          {
            columnId: 'Nacionalidad',
            title: 'Nacionalidad',
            options: nationality,
          },
          {
            columnId: 'Genero',
            title: 'Genero',
            options: gender,
          },
        ],
        searchableColumns: [{ columnId: 'Nombre', placeholder: 'Buscar empleado...' }],
        showViewOptions: true,
      }}
    />
  );
}
