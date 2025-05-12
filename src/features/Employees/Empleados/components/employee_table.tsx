import { fetchAllEmployees } from '@/shared/actions/employees.actions';
import { VisibilityState } from '@tanstack/react-table';
import { cookies } from 'next/headers';
import { EmployeesTableReusable } from './tables/data/employees-table';
import { formatEmployeesForTable } from './utils/utils';

async function EmployeeTable() {
  const employees = await fetchAllEmployees();
  const formattedEmployees = formatEmployeesForTable(employees);
  const cookiesStore = cookies();
  const savedVisibility = cookiesStore.get(`table-columns-employees-table`)?.value;

  console.log(savedVisibility, 'savedVisibility');

  return (
    <div>
      <EmployeesTableReusable
        employees={formattedEmployees}
        tableId="employees-table"
        savedVisibility={JSON.parse(savedVisibility || '{}') as VisibilityState}
      />
    </div>
  );
}

export default EmployeeTable;
