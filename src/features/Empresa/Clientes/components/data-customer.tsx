'use client';

import { ColumnDef } from '@tanstack/react-table';

import { createFilterOptions } from '@/features/Employees/Empleados/components/utils/utils';
import { BaseDataTable } from '@/shared/components/data-table/base/data-table';
import { fechAllCustomers } from '../actions/create';

interface DataCustomersProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[] | any;
  data: Awaited<ReturnType<typeof fechAllCustomers>>;
  savedCustomers?: string;
}

export function DataCustomers<TData, TValue>({ columns, data, savedCustomers }: DataCustomersProps<TData, TValue>) {
  const names = createFilterOptions(data, (customer) => customer.name);
  const cuit = createFilterOptions(data, (customer) => customer.cuit);
  const client_email = createFilterOptions(data, (customer) => customer.client_email);
  const client_phone = createFilterOptions(data, (customer) => customer.client_phone);
  const savedVisibility = savedCustomers ? JSON.parse(savedCustomers) : {};

  return (
    <BaseDataTable
      data={data || []}
      savedVisibility={savedVisibility}
      columns={columns}
      tableId="customers-table"
      toolbarOptions={{
        filterableColumns: [
          {
            columnId: 'Nombre',
            title: 'Nombre',
            options: names,
          },
          {
            columnId: 'Cuit',
            title: 'Cuit',
            options: cuit,
          },
          {
            columnId: 'Email',
            title: 'Email',
            options: client_email,
          },
          {
            columnId: 'Telefono',
            title: 'Telefono',
            options: client_phone,
          },
        ],
      }}
    />
  );
}
