import { fetchAllEmployees } from '@/shared/actions/employees.actions';
import { EmployeesTableReusable } from './tables/data/employees-table';
import { formatEmployeesForTable } from './utils/utils';

async function EmployeeTable() {
  const employees = await fetchAllEmployees();
  const formattedEmployees = formatEmployeesForTable(employees);

  return (
    <div>
      <EmployeesTableReusable employees={formattedEmployees} tableId="employees-table" />
    </div>
  );
}

export default EmployeeTable;
