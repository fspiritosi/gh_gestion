// Este archivo contiene los tipos específicos para la tabla de empleados
import { fetchAllEmployees } from '@/shared/actions/employees.actions';

// Tipo base para los datos que vienen de la API
export type EmployeeBaseData = Awaited<ReturnType<typeof fetchAllEmployees>>[number];

// Tipo extendido con los campos adicionales agregados por formatEmployeesForTable
export interface EmployeeTableData extends EmployeeDetailed {
  fullName?: string; // Campo agregado por formatEmployeesForTable
}
