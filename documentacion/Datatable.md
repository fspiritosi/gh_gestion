# DataTable

## Props

- columns: ColumnDef<T, unknown>[]
- data: T[]
- tableId: string
- savedVisibility: VisibilityState
- onRowClick?: (row: T) => void
- className?: string
- toolbarOptions?: ToolbarOptions

## Ejemplo de uso

```tsx
const employees = await getAllEmployees();
const formattedEmployees = formatEmployeesForTable(employees);
const cookiesStore = cookies();
const savedVisibility = cookiesStore.get(`table-columns-employees-table`)?.value;

return (
  <div>
    <EmployeesTableReusable
      employees={formattedEmployees}
      tableId="employees-table"
      savedVisibility={JSON.parse(savedVisibility || '{}') as VisibilityState}
    />
  </div>
);
```
