import { fetchAllEmployees } from '@/shared/actions/employees.actions';

export const formatEmployeesForTable = (employees: Awaited<ReturnType<typeof fetchAllEmployees>>) => {
  return employees.map((employee) => ({
    ...employee,
    fullName: `${employee.firstname} ${employee.lastname}`,
  }));
};
