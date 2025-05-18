'use client';
import { buttonVariants } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseDataTable } from '@/shared/components/data-table/base/data-table';
import { DataTableColumnHeader } from '@/shared/components/data-table/base/data-table-column-header';
import { ColumnDef, FilterFn, Row, VisibilityState } from '@tanstack/react-table';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getDailyReports, updateDailyReportStatus } from './actions/actions';

const dateRangeFilter: FilterFn<Awaited<ReturnType<typeof getDailyReports>>[number]> = (
  row: Row<Awaited<ReturnType<typeof getDailyReports>>[number]>,
  columnId: string,
  filterValue: { from?: Date | null; to?: Date | null },
  addMeta: (meta: any) => void
) => {
  const validityRaw = row.original.date;
  const { from, to } = filterValue || {};
  // console.log('[dateRangeFilter] row:', row);
  // console.log('[dateRangeFilter] columnId:', columnId);
  // console.log('[dateRangeFilter] filterValue:', filterValue);
  if (!validityRaw) {
    // console.log('[dateRangeFilter] No validity value, return false');
    return false;
  }
  if (validityRaw === 'No vence') {
    // console.log('[dateRangeFilter] Valor "No vence", return false');
    return false;
  }

  // Parsear la fecha del documento
  const [day, month, year] = validityRaw.split('/');
  const validityMoment = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD');
  if (!validityMoment.isValid()) {
    // console.log('[dateRangeFilter] Fecha inválida:', `${year}-${month}-${day}`);
    return false;
  }
  // console.log('[dateRangeFilter] validityMoment:', validityMoment.format());

  // Comparaciones con moment
  if (from && !to) {
    const fromMoment = moment(from);
    const result = validityMoment.isSameOrAfter(fromMoment, 'day');
    // console.log(`[dateRangeFilter] Comparando >= from (${fromMoment.format('YYYY-MM-DD')}):`, result);
    return result;
  }
  if (!from && to) {
    const toMoment = moment(to);
    const result = validityMoment.isSameOrBefore(toMoment, 'day');
    // console.log(`[dateRangeFilter] Comparando <= to (${toMoment.format('YYYY-MM-DD')}):`, result);
    return result;
  }
  if (from && to) {
    const fromMoment = moment(from);
    const toMoment = moment(to);
    const result = validityMoment.isBetween(fromMoment, toMoment, 'day', '[]');

    return result;
  }
  // console.log('[dateRangeFilter] Sin from/to, return true');
  return true;
};
export const reportColumnas: ColumnDef<Awaited<ReturnType<typeof getDailyReports>>[number]>[] = [
  {
    accessorKey: 'date',
    id: 'Fecha',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de parte diario" />,
    cell: ({ row }) => <span className="font-medium">{moment(row.original.date).format('DD/MM/YYYY')}</span>,
    filterFn: dateRangeFilter,
  },
  {
    accessorKey: 'status',
    id: 'Estado',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const router = useRouter();

      return (
        <Select
          value={row.original.status ? 'abierto' : 'cerrado'}
          onValueChange={async (value) => {
            toast.promise(
              async () => {
                const newStatus = value === 'abierto';
                await updateDailyReportStatus(row.original.id, newStatus);
                router.refresh();
              },
              {
                loading: 'Actualizando estado...',
                success: 'Estado actualizado correctamente',
                error: 'Error al actualizar estado',
              }
            );
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="abierto">Abierto</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>
      );
    },
    filterFn: (row, id, value) => {
      const statusValue = row.original.status ? 'abierto' : 'cerrado';
      return value.includes(statusValue);
    },
  },
  {
    accessorKey: 'actions',
    header: 'Acciones',
    id: 'Acciones',
    cell: ({ row }) => (
      <Link className={buttonVariants({ variant: 'outline' })} href={`/dashboard/operations/${row.original.id}`}>
        Ver completo
      </Link>
    ),
  },
];

function DailyReportTable({
  savedVisibility,
  dailyReports,
}: {
  savedVisibility: VisibilityState;
  dailyReports: Awaited<ReturnType<typeof getDailyReports>>;
}) {
  const statusOptions = [
    { value: 'abierto', label: 'Abierto' },
    { value: 'cerrado', label: 'Cerrado' },
  ];
  return (
    <BaseDataTable
      tableId="dailyReportTable"
      columns={reportColumnas}
      data={dailyReports}
      savedVisibility={savedVisibility}
      toolbarOptions={{
        filterableColumns: [
          {
            columnId: 'Fecha',
            title: 'Fecha',
            type: 'date-range',
            fromPlaceholder: 'Desde (Fecha)',
            toPlaceholder: 'Hasta (Fecha)',
            showFrom: true,
            showTo: true,
          },
          {
            columnId: 'Estado',
            title: 'Estado',
            options: statusOptions,
          },
        ],
      }}
    />
  );
}

export default DailyReportTable;
