import { fetchAllEmployees } from '@/shared/actions/employees.actions';
import { VisibilityState } from '@tanstack/react-table';
import { cookies } from 'next/headers';
import { EmployeesTableReusable } from './tables/data/employees-table';
import { formatEmployeesForTable } from './utils/utils';

async function EmployeeTable() {
  const employees = await fetchAllEmployees();
  const formattedEmployees = formatEmployeesForTable(employees);
  const cookiesStore = cookies();
  const savedVisibility = cookiesStore.get(`employees-table`)?.value;
  const savedFilters = cookiesStore.get(`employees-table-filters`)?.value;

  // console.log(savedVisibility, 'savedVisibility');

  return (
    <div>
      <EmployeesTableReusable
        employees={formattedEmployees}
        tableId="employees-table"
        savedVisibility={JSON.parse(savedVisibility || '{}') as VisibilityState}
        savedFilters={JSON.parse(savedFilters || '[]')}
      />
    </div>
  );
}

export default EmployeeTable;
