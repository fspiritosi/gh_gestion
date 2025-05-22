'use client';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createFilterOptions } from '@/features/Employees/Empleados/components/utils/utils';
import { cn } from '@/lib/utils';
import { BaseDataTable } from '@/shared/components/data-table/base/data-table';
import { DataTableColumnHeader } from '@/shared/components/data-table/base/data-table-column-header';
import { ColumnDef, VisibilityState } from '@tanstack/react-table';
import { Edit, Info } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import {
  getActiveEmployeesForDailyReport,
  getActiveEquipmentsForDailyReport,
  getCustomers,
  getDailyReportById,
} from '../actions/actions';
import { BulkEditModal } from './BulkEditModal';
import { ClonarRegistrosButton } from './ClonarRegistrosButton';
import { DailyReportForm } from './DailyReportRowForm';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentViewerModal from './DocumentViewerFixed';
import HistoryModal from './HistoryModal';
export const transformDailyReports = (reports: Awaited<ReturnType<typeof getDailyReportById>>) => {
  const report = reports[0];
  return report.dailyreportrows.map((row) => ({
    id: row.id,
    date: report.date,
    type_service: row.type_service,
    customer: row.customers?.name,
    cancel_reason: row.cancel_reason,
    employees: row.dailyreportemployeerelations.map((rel) => rel.employees?.firstname + ' ' + rel.employees?.lastname),
    equipment:
      row.dailyreportequipmentrelations.map((rel) => rel.vehicles?.intern_number || rel.vehicles?.domain) || [],
    customer_equipment:
      row.dailyreport_customer_equipment_relations.map((rel) => {
        return {
          name: rel.equipos_clientes?.name,
          type: rel.equipos_clientes?.type,
          id: rel.equipos_clientes?.id,
          relacion_id: rel.id,
        };
      }) || [],
    services: row.customer_services?.service_name,
    item: row.service_items?.item_name,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    working_day: row.working_day,
    sector_customer_id: row.service_sectors?.id,
    sector_service_name: row.service_sectors?.sectors?.name,
    areas_customer_id: row.service_areas?.id,
    areas_customer_name: row.service_areas?.areas_cliente?.descripcion_corta,
    description: row.description || '',
    document_path: row.document_path,
    remit_number: row.remit_number,
    employees_references: row.dailyreportemployeerelations.map((rel) => ({
      name: rel.employees?.firstname + ' ' + rel.employees?.lastname,
      id: rel.employees?.id,
    })),
    equipment_references: row.dailyreportequipmentrelations.map((rel) => ({
      name: rel.vehicles?.intern_number || rel.vehicles?.domain,
      id: rel.vehicles?.id,
    })),
    data_to_clone: {
      customer_id: row.customers?.id,
      service_id: row.customer_services?.id,
      item_id: row.service_items?.id,
      working_day: row.working_day,
      start_time: row.start_time,
      end_time: row.end_time,
      description: row.description,
      // daily_report_id: row.id,
      areas_service_id: row.areas_service_id,
      sector_service_id: row.sector_service_id,
    },
  }));
};

export type DailyReportRow = ReturnType<typeof transformDailyReports>[number];

export function getDailyReportColumns(onEdit: (row: DailyReportRow) => void): ColumnDef<DailyReportRow>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="w-[20px]">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        </div>
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      accessorKey: 'sector_service_name',
      id: 'Sector',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sector" />,
      cell: ({ row }) => {
        return row.original.sector_service_name ? (
          <Badge variant={'outline'} className="font-medium">
            {row.original.sector_service_name}
          </Badge>
        ) : null;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'areas_customer_name',
      id: 'Área',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Área" />,
      cell: ({ row }) => {
        return row.original.areas_customer_name ? (
          <Badge variant={'outline'} className="font-medium">
            {row.original.areas_customer_name}
          </Badge>
        ) : null;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'type_service',
      id: 'Tipo de servicio',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de servicio" />,
      cell: ({ row }) => {
        return row.original.type_service ? (
          <Badge className="font-medium capitalize">{row.original.type_service}</Badge>
        ) : null;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'customer_equipment',
      id: 'Equipo cliente',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Equipo cliente" />,
      cell: ({ row }) => {
        const employees = row.original.customer_equipment;
        if (!employees || employees.length === 0) return null;
        const [first, ...rest] = employees;
        if (rest.length === 0) {
          return (
            <Badge variant="default" className="select-none text-nowrap">
              {first.name} ({first.type})
            </Badge>
          );
        }
        return (
          <>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="default" className="cursor-pointer select-none text-nowrap ">
                    {first.name}({first.type}) +{rest.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-1">
                    {rest.map((employe) => (
                      <p key={employe.name}>
                        {employe.name}({employe.type})
                      </p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        );
      },
      filterFn: (row, id, value) => {
        const rowValues = row.getValue(id) || ([] as any);
        // Aseguramos que ambos sean arrays
        if (!Array.isArray(rowValues.map((item: any) => item.name)) || !Array.isArray(value)) return false;
        // ¿Algún elemento de value está en rowValues?
        return value.some((val: any) => rowValues.map((item: any) => item.name).includes(val));
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
      cell: ({ row }) => <span className="font-medium capitalize">{row.original.working_day}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'status',
      id: 'Estado',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        const variants = {
          ejecutado: 'success',
          pendiente: 'default',
          reprogramado: 'warning',
          cancelado: 'destructive',
          sin_recursos_asignados: 'warning',
        };

        const status = row.original.status;
        const cancelReason = row.original.cancel_reason;
        const isCancelled = status === 'cancelado';

        if (isCancelled && cancelReason) {
          return (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <Badge
                      variant={variants[status as keyof typeof badgeVariants]}
                      className="font-medium capitalize whitespace-nowrap"
                    >
                      {status.replaceAll('_', ' ')}
                      <Info className="ml-1 h-3.5 w-3.5 flex-shrink-0 inline-block" />
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[400px]">
                  <p className="whitespace-pre-wrap break-words">{cancelReason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <Badge variant={variants[status as keyof typeof badgeVariants]} className="font-medium capitalize">
            {status.replaceAll('_', ' ')}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: 'actions',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Acciones" />,
      cell: ({ row }) => {
        // Si el estado es 'ejecutado' y hay un documento, mostrar botón para verlo
        if (row.original.status === 'ejecutado') {
          return row.original.document_path ? (
            <DocumentViewerModal documentUrl={row.original.document_path} documentData={row.original} />
          ) : (
            <DocumentUploadModal documentData={row.original} />
          );
        }

        // Para otros estados, mostrar botones de editar/eliminar
        return (
          <div className={cn('flex gap-1', moment(row.original.date).isBefore(moment()) ? 'gap-0 justify-center' : '')}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:text-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(row.original);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Editar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HistoryModal onlyIcon dailyReportRowId={row.original.id} />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Editar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DeleteConfirmationModal date={row.original.date} dailyReportId={row.original.id} />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Eliminar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];
}

export function DayliReportDetailTable({
  dailyReport,
  savedVisibility,
  customers,
  employees,
  equipments,
  dailyReportId,
}: {
  dailyReportId: string;
  dailyReport: Awaited<ReturnType<typeof getDailyReportById>>;
  savedVisibility: VisibilityState;
  customers: Awaited<ReturnType<typeof getCustomers>>;
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
  const allCustomerEquipmentName = formattedData
    .flatMap((area) => area.customer_equipment.map((eq) => eq.name))
    .filter(Boolean);
  const customerEquipmentOptions = createFilterOptions(allCustomerEquipmentName, (name) => name);

  const jornadaOptions = createFilterOptions(formattedData, (area) => area.working_day);
  const statusOptions = createFilterOptions(formattedData, (area) => area.status);
  const [selectedRow, setSelectedRow] = useState<(typeof formattedData)[0] | null>(null);
  const sectorOptions = createFilterOptions(formattedData, (area) => area.sector_service_name);
  const areaOptions = createFilterOptions(formattedData, (area) => area.areas_customer_name);
  const typeServiceOptions = createFilterOptions(formattedData, (area) => area.type_service);

  const handleEditRow = useCallback((row: (typeof formattedData)[0]) => {
    setSelectedRow(row);
    document.getElementById('open-button-daily-report')?.click();
  }, []);
  // Estado para controlar la apertura del modal
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DailyReportRow[]>([]);
  const router = useRouter();
  return (
    <>
      <div
        className={cn('flex justify-between items-center', dailyReport[0].status !== 'abierto' ? 'justify-end' : '')}
      >
        <DailyReportForm
          customers={customers}
          employees={employees}
          equipments={equipments}
          dailyReportId={dailyReportId}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          defaultValues={selectedRow}
          disabled={dailyReport[0].status !== 'abierto'}
        />
        <ClonarRegistrosButton formattedData={formattedData.filter((row) => row.type_service === 'mensual')} />
      </div>
      <BaseDataTable
        className="mt-4"
        columns={getDailyReportColumns(handleEditRow)}
        data={formattedData || []}
        savedVisibility={savedVisibility}
        tableId="dailyReportTableDetail"
        toolbarOptions={{
          bulkAction: {
            enabled: true,
            label: 'Editar',
            icon: <Edit className="h-4 w-4" />,
            onClick: (rows) => {
              setSelectedRows(rows);
              setIsBulkEditModalOpen(true);
            },
          },
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
              columnId: 'Tipo de servicio',
              title: 'Tipo de servicio',
              options: typeServiceOptions,
            },
            {
              columnId: 'Estado',
              title: 'Estado',
              options: statusOptions,
            },
            {
              columnId: 'Sector',
              title: 'Sector',
              options: sectorOptions,
            },
            {
              columnId: 'Área',
              title: 'Área',
              options: areaOptions,
            },
            {
              columnId: 'Equipo cliente',
              title: 'Equipo cliente',
              options: customerEquipmentOptions,
            },
          ],
        }}
      />
      {/* Modal de edición masiva */}
      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedRows={selectedRows}
        onSuccess={() => {
          // Recargar datos o refrescar la tabla
          router.refresh();
          // O cualquier otra función que recargue los datos
        }}
      />
    </>
  );
}

export default DayliReportDetailTable;
