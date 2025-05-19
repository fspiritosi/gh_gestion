'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createFilterOptions } from '@/features/Employees/Empleados/components/utils/utils';
import { BaseDataTable } from '@/shared/components/data-table/base/data-table';
import { DataTableColumnHeader } from '@/shared/components/data-table/base/data-table-column-header';
import { ColumnDef, VisibilityState } from '@tanstack/react-table';
import moment from 'moment';
import { useCallback, useState } from 'react';
import {
  getActiveEmployeesForDailyReport,
  getActiveEquipmentsForDailyReport,
  getCustomers,
  getCustomersServices,
  getDailyReportById,
  getServiceItems,
} from '../actions/actions';
import { DailyReportForm } from './DailyReportForm';
export const transformDailyReports = (reports: Awaited<ReturnType<typeof getDailyReportById>>) => {
  const report = reports[0];
  return report.dailyreportrows.map((row) => ({
    id: row.id,
    date: report.date,
    customer: row.customers?.name,
    employees: row.dailyreportemployeerelations.map((rel) => rel.employees?.firstname + ' ' + rel.employees?.lastname),
    equipment: row.dailyreportequipmentrelations.map((rel) => rel.vehicles?.intern_number || rel.vehicles?.domain),
    services: row.service_items?.item_name,
    item: row.service_items?.item_name,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    working_day: row.working_day,
    description: row.description || '',
    document_path: row.document_path,
  }));
};

export function getDailyReportColumns(
  onEdit: (row: ReturnType<typeof transformDailyReports>[number]) => void
): ColumnDef<ReturnType<typeof transformDailyReports>[number]>[] {
  return [
    {
      accessorKey: 'customer',
      id: 'Cliente',
      // header: () => <span className="w-[200px]">Nombre</span>,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
      cell: ({ row }) => <span className="font-medium select-none text-nowrap">{row.original.customer}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'services',
      id: 'Servicio',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Servicio" />,
      cell: ({ row }) => <span className="font-medium">{row.original.services}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'item',
      id: 'Item',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Item" />,
      cell: ({ row }) => <span className="font-medium">{row.original.item}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'employees',
      id: 'Empleados',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Empleados" />,
      cell: ({ row }) => {
        const employees: string[] = row.original.employees;
        if (!employees || employees.length === 0) return null;
        const [first, ...rest] = employees;
        if (rest.length === 0) {
          return (
            <Badge variant="default" className="select-none text-nowrap">
              {first}
            </Badge>
          );
        }
        return (
          <>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="default" className="cursor-pointer select-none text-nowrap ">
                    {first} +{rest.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-1">
                    {rest.map((employe) => (
                      <p key={employe}>{employe}</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        );
      },
      filterFn: (row, id, value) => {
        const rowValues = row.getValue(id) || [];
        // Aseguramos que ambos sean arrays
        if (!Array.isArray(rowValues) || !Array.isArray(value)) return false;
        // ¿Algún elemento de value está en rowValues?
        return value.some((val) => rowValues.includes(val));
      },
    },
    {
      accessorKey: 'equipment',
      id: 'Equipo',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Equipo" />,
      cell: ({ row }) => {
        const equipment = row.original.equipment;
        if (!equipment || equipment.length === 0) return null;
        const [first, ...rest] = equipment;
        if (rest.length === 0) {
          return <Badge variant="default">{first}</Badge>;
        }
        return (
          <>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="default" className="cursor-pointer select-none">
                    {first} +{rest.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-1">
                    {rest.map((equipment) => (
                      <p key={equipment}>{equipment}</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        );
      },
      filterFn: (row, id, value) => {
        const rowValues = row.getValue(id) || [];
        // Aseguramos que ambos sean arrays
        if (!Array.isArray(rowValues) || !Array.isArray(value)) return false;
        // ¿Algún elemento de value está en rowValues?
        return value.some((val) => rowValues.includes(val));
      },
    },
    {
      accessorKey: 'working_day',
      id: 'Jornada',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Jornada" />,
      cell: ({ row }) => <span className="font-medium">{row.original.working_day}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'start_time',
      id: 'Hora inicio',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hora inicio" />,
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.start_time ? moment(row.original.start_time, 'HH:mm:ss').format('HH:mm') : ''}
        </span>
      ),
    },
    {
      accessorKey: 'end_time',
      id: 'Hora fin',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hora fin" />,
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.end_time ? moment(row.original.end_time, 'HH:mm:ss').format('HH:mm') : ''}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      id: 'Estado',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => <Badge className="font-medium">{row.original.status}</Badge>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'description',
      id: 'Descripción',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
      cell: ({ row }) => <span className="font-medium">{row.original.description}</span>,
    },
    {
      id: 'actions',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Acciones" />,
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="hover:text-blue-400"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.original);
          }}
        >
          Editar
        </Button>
      ),
    },
  ];
}

function DayliReportDetailTable({
  dailyReport,
  savedVisibility,
  customers,
  customers_services,
  service_items,
  employees,
  equipments,
  dailyReportId,
}: {
  dailyReportId: string;
  dailyReport: Awaited<ReturnType<typeof getDailyReportById>>;
  savedVisibility: VisibilityState;
  customers: Awaited<ReturnType<typeof getCustomers>>;
  customers_services: Awaited<ReturnType<typeof getCustomersServices>>;
  service_items: Awaited<ReturnType<typeof getServiceItems>>;
  employees: Awaited<ReturnType<typeof getActiveEmployeesForDailyReport>>;
  equipments: Awaited<ReturnType<typeof getActiveEquipmentsForDailyReport>>;
}) {
  const formattedData = transformDailyReports(dailyReport);
  const customerOptions = createFilterOptions(formattedData, (area) => area.customer);
  const servicesOptions = createFilterOptions(formattedData, (area) => area.services);
  const itemsOptions = createFilterOptions(formattedData, (area) => area.item);
  const allEmployeesName = formattedData.flatMap((area) => area.employees).filter(Boolean);
  const employeesOptions = createFilterOptions(allEmployeesName, (name) => name);
  const allEquipmentName = formattedData.flatMap((area) => area.equipment).filter(Boolean);
  const equipmentOptions = createFilterOptions(allEquipmentName, (name) => name);
  const jornadaOptions = createFilterOptions(formattedData, (area) => area.working_day);
  const statusOptions = createFilterOptions(formattedData, (area) => area.status);
  // Agregar al inicio del archivo
  const [selectedRow, setSelectedRow] = useState<(typeof formattedData)[0] | null>(null);

  // Manejador para editar fila
  const handleEditRow = useCallback((row: (typeof formattedData)[0]) => {
    setSelectedRow(row);
    document.getElementById('open-button-daily-report')?.click();
  }, []);

  return (
    <>
      <DailyReportForm
        customers={customers}
        customers_services={customers_services}
        service_items={service_items}
        employees={employees}
        equipments={equipments}
        dailyReportId={dailyReportId}
        defaultValues={selectedRow}
      />
      <BaseDataTable
        onRowClick={(row) => {
          // setSelectedDailyReport(row.original);
        }}
        className="mt-4"
        columns={getDailyReportColumns(handleEditRow)}
        data={formattedData || []}
        savedVisibility={savedVisibility}
        tableId="dailyReportTableDetail"
        toolbarOptions={{
          filterableColumns: [
            {
              columnId: 'Cliente',
              title: 'Cliente',
              options: customerOptions,
            },
            {
              columnId: 'Servicio',
              title: 'Servicio',
              options: servicesOptions,
            },
            {
              columnId: 'Item',
              title: 'Item',
              options: itemsOptions,
            },
            {
              columnId: 'Empleados',
              title: 'Empleados',
              options: employeesOptions,
            },
            {
              columnId: 'Equipo',
              title: 'Equipo',
              options: equipmentOptions,
            },
            {
              columnId: 'Jornada',
              title: 'Jornada',
              options: jornadaOptions,
            },
            {
              columnId: 'Estado',
              title: 'Estado',
              options: statusOptions,
            },
          ],
        }}
      />
    </>
  );
}

export default DayliReportDetailTable;
