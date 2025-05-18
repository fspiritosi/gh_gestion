import { fetchAllEmployees } from '@/shared/actions/employees.actions';

export const formatEmployeesForTable = (employees: Awaited<ReturnType<typeof fetchAllEmployees>>) => {
  return employees?.map((employee) => ({
    ...employee,
    fullName: `${employee.firstname} ${employee.lastname}`,
  }));
};

// Función utilitaria para crear opciones de filtro a partir de una propiedad simple
export const createFilterOptions = <T extends any>(
  data: T[] | undefined,
  accessor: (item: T) => any,
  icon?: React.ComponentType<{ className?: string }>
) => {
  return Array.from(new Set(data?.map(accessor).filter(Boolean))).map((value) => ({
    label: value || '',
    value: value || '',
    icon,
  }));
};
