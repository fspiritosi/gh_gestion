'use client';

import { BaseDataTable } from '@/shared/components/data-table/base/data-table';
import { UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatEmployeesForTable } from '@/features/(Employees)/modules/employees/components/utils/utils';
import { employeeColumns } from './columns';
import { EmployeeTableData } from './types';

interface EmployeesTableProps {
  onRowClick?: (employee: EmployeeTableData) => void;
  className?: string;
  employees?: ReturnType<typeof formatEmployeesForTable>;
  tableId?: string;
}

export function EmployeesTableReusable({
  onRowClick,
  className,
  employees,
  tableId = 'employees-table',
}: EmployeesTableProps) {
  const router = useRouter();

  // Opciones para filtros
  const positions = Array.from(
    new Set(employees?.map((employee) => employee?.hierarchical_position?.name).filter(Boolean))
  ).map((position) => ({
    label: position || '',
    value: position || '',
    icon: UserIcon,
  }));

  const afectacionesOpciones = Array.from(
    new Set(
      employees
        ?.map((employee) =>
          employee?.contractor_employee?.map((contractor) => contractor?.contractor_id?.name).filter(Boolean)
        )
        .flat()
        .filter(Boolean)
    )
  ).map((afectacion) => ({
    label: afectacion || '',
    value: afectacion || '',
    icon: UserIcon,
  }));

  const contractTypes = Array.from(
    new Set(employees?.map((employee) => employee?.type_of_contract).filter(Boolean))
  ).map((contractType) => ({
    label: contractType || '',
    value: contractType || '',
    icon: UserIcon,
  }));

  const statuses = Array.from(new Set(employees?.map((employee) => employee?.status).filter(Boolean))).map(
    (status) => ({
      label: status || '',
      value: status || '',
      icon: UserIcon,
    })
  );

  // Extractores de opciones para otros filtros basados en las columnas existentes
  const documentosNumeros = Array.from(
    new Set(employees?.map((employee) => employee?.document_number).filter(Boolean))
  ).map((value) => ({
    label: value || '',
    value: value || '',
    icon: UserIcon,
  }));

  const tiposDocumento = Array.from(new Set(employees?.map((employee) => employee?.document_type).filter(Boolean))).map(
    (value) => ({
      label: value || '',
      value: value || '',
      icon: UserIcon,
    })
  );

  const cuils = Array.from(new Set(employees?.map((employee) => employee?.cuil).filter(Boolean))).map((value) => ({
    label: value || '',
    value: value || '',
    icon: UserIcon,
  }));

  const handleRowClick = (employee: EmployeeTableData) => {
    if (onRowClick) {
      onRowClick(employee);
    } else {
      router.push(`/dashboard/employee/action?id=${employee.id}`);
    }
  };

  return (
    <BaseDataTable
      columns={employeeColumns}
      data={employees || []}
      onRowClick={handleRowClick}
      className={className}
      tableId={tableId}
      toolbarOptions={{
        filterableColumns: [
          {
            columnId: 'Nombre',
            title: 'Nombre',
            options: Array.from(new Set(employees?.map((employee) => employee?.fullName).filter(Boolean))).map(
              (value) => ({
                label: value || '',
                value: value || '',
                icon: UserIcon,
              })
            ),
          },
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
            columnId: 'Documento',
            title: 'Documento',
            options: documentosNumeros,
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
        ],
        searchableColumns: [{ columnId: 'Nombre', placeholder: 'Buscar empleado...' }],
        showViewOptions: true,
      }}
    />
  );
}
