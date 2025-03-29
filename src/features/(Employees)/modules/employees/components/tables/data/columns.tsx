'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/shared/components/data-table/base/data-table-column-header';
import { PersonIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { formatEmployeesForTable } from '@/features/(Employees)/modules/employees/components/utils/utils';
import { format } from 'date-fns';

export const employeeColumns: ColumnDef<ReturnType<typeof formatEmployeesForTable>[0], unknown>[] = [
  {
    accessorKey: 'fullName',
    id: 'Nombre',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => {
      const fullName = `${row.original.fullName}`;
      return (
        <div className="font-medium flex gap-2 items-center">
          <PersonIcon />
          {fullName}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const fullName = `${row.original.fullName}`.toLowerCase();

      // Verificar si el valor es un array (desde el filtro de facetas) o un string (desde el campo de búsqueda)
      if (Array.isArray(value)) {
        return value.some((val) => fullName.includes(String(val).toLowerCase()));
      }

      // Asegurar que value sea tratado como string
      return fullName.includes(String(value).toLowerCase());
    },
  },
  {
    accessorKey: 'status',
    id: 'Estado',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>['variant']>;
      type StatusType = 'Completo' | 'Incompleto' | 'Completo con doc vencida' | 'default';

      const variantStatus: Record<StatusType, BadgeVariant> = {
        Completo: 'success',
        Incompleto: 'destructive',
        'Completo con doc vencida': 'yellow',
        default: 'default',
      };
      return (
        <Badge
          variant={row.original.status ? variantStatus[row.original.status as StatusType] || 'default' : 'default'}
          className="capitalize"
        >
          {row.original.status || 'Sin estado'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    //Cuil
    accessorKey: 'cuil',
    id: 'Cuil',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cuil" />,
    cell: ({ row }) => {
      return <div>{row.original.cuil || '-'}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    //Tipo de documento
    accessorKey: 'document_type',
    id: 'Tipo de Documento',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Documento" />,
    cell: ({ row }) => {
      return <div>{row.original.document_type}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: 'document_number',
    id: 'Documento',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Documento" />,
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          {/* <IdCardIcon /> */}
          {row.original.document_number}
        </div>
      );
    },
  },
  {
    accessorKey: 'hierarchical_position.name',
    id: 'Cargo',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cargo" />,
    cell: ({ row }) => {
      return <div>{row.original.hierarchical_position.name}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    //Horas normales
    accessorKey: 'normal_hours',
    id: 'Horas',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Horas" />,
    cell: ({ row }) => {
      return <div>{row.original.normal_hours}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    //Tipo de contrato
    accessorKey: 'type_of_contract',
    id: 'Tipo de Contrato',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Contrato" />,
    cell: ({ row }) => {
      return <div>{row.original.type_of_contract}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: 'email',
    id: 'Email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      return <div>{row.original.email || '-'}</div>;
    },
  },
  {
    //Afectaciones
    accessorKey: 'contractor_employee',
    id: 'Afectaciones',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Afectaciones" />,
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-1">
          {row.original.contractor_employee && row.original.contractor_employee.length > 0 ? (
            row.original.contractor_employee.map((contractor) => (
              <Badge key={contractor.id} className="mr-1 mb-1">
                {contractor?.contractor_id?.name || 'Sin nombre'}
              </Badge>
            ))
          ) : (
            <span>-</span>
          )}
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      // Si no hay filtro o el array está vacío, devolvemos true (mostrar la fila)
      if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) return true;

      const contractorEmployees = row.getValue(id);

      // Si no hay afectaciones, no coincide con ningún filtro
      if (!contractorEmployees || !Array.isArray(contractorEmployees) || contractorEmployees.length === 0) {
        return false;
      }

      // Comprobamos si alguna de las afectaciones coincide con alguno de los valores del filtro
      return contractorEmployees.some((contractor) => {
        if (!contractor || !contractor.contractor_id || !contractor.contractor_id.name) return false;
        return filterValue.includes(contractor.contractor_id.name);
      });
    },
  },
  {
    accessorKey: 'phone',
    id: 'Teléfono',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
    cell: ({ row }) => {
      return <div>{row.original.phone || '-'}</div>;
    },
  },
  // {
  //   accessorKey: 'birthdate',
  //   id: 'Fecha de Nacimiento',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de Nacimiento" />,
  //   cell: ({ row }) => {
  //     const birthdate = row.original.;
  //     if (!birthdate) return <div>-</div>;
  //     try {
  //       return <div>{format(new Date(birthdate), 'dd/MM/yyyy', { locale: es })}</div>;
  //     } catch (error) {
  //       return <div>-</div>;
  //     }
  //   },
  // },
];
