'use client';

import { DialogFooter } from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { checkDailyReportExists, createDailyReport, createDailyReportRow } from '../actions/actions';
import { transformDailyReports } from './DayliReportDetailTable';

interface ClonarRegistrosButtonProps {
  formattedData: ReturnType<typeof transformDailyReports>;
}

export function ClonarRegistrosButton({ formattedData }: ClonarRegistrosButtonProps) {
  const [open, setOpen] = useState(false);
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [irARegistros, setIrARegistros] = useState(true);
  const router = useRouter();

  const handleClonar = async () => {
    toast.promise(
      async () => {
        if (fechasSeleccionadas.length === 0) {
          throw new Error('Debes seleccionar al menos una fecha para clonar los registros');
        }
        setLoading(true);

        const formattedDates = fechasSeleccionadas.map((date) => format(date, 'yyyy-MM-dd'));
        console.log('Clonando registros para fechas:', formattedDates);

        // Verificar qué reportes ya existen
        const existingReports = await checkDailyReportExists(formattedDates);
        const existingReportDates = new Set(existingReports?.map((report) => report.date) || []);

        // Separar fechas en nuevas y existentes
        const newDates = formattedDates.filter((date) => !existingReportDates.has(date));

        // Crear nuevos reportes para las fechas que no existen
        let createdReports: Awaited<ReturnType<typeof createDailyReport>> = [];
        if (newDates.length > 0) {
          createdReports = await createDailyReport(newDates);
        }

        // Combinar reportes existentes con los recién creados
        const allReports = [...(existingReports || []), ...(createdReports || [])];
        // Para cada reporte (nuevo o existente), clonar las filas
        for (const report of allReports) {
          const formattedRows = formattedData.map((row) => ({
            customer_id: row.data_to_clone.customer_id!,
            service_id: row.data_to_clone.service_id!,
            item_id: row.data_to_clone.item_id!,
            working_day: row.data_to_clone.working_day!,
            start_time: row.data_to_clone.start_time,
            end_time: row.data_to_clone.end_time,
            description: row.data_to_clone.description,
            daily_report_id: report.id,
            status: 'sin_recursos_asignados',
            areas_service_id: row.data_to_clone.areas_service_id,
            sector_service_id: row.data_to_clone.sector_service_id,
          }));

          await createDailyReportRow(formattedRows);
        }

        // Si solo hay un reporte y se debe navegar, ir al primer reporte creado
        if (irARegistros && allReports.length > 0) {
          router.push(`/dashboard/operations/${allReports[0].id}`);
          router.refresh();
        }

        setOpen(false);
        setFechasSeleccionadas([]);
      },
      {
        loading: 'Clonando registros...',
        success: () => {
          setOpen(false);
          setFechasSeleccionadas([]);
          setLoading(false);
          return 'Registros clonados exitosamente!';
        },
        error: (error) => {
          setLoading(false);
          return error || 'Ocurrió un error al clonar los registros';
        },
      }
    );
  };

  const removeFecha = (fecha: Date) => {
    setFechasSeleccionadas((prev) => prev.filter((d) => d.toDateString() !== fecha.toDateString()));
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Clonar Registros
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white text-black p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl">
              Clonar registros del {moment(formattedData?.[0]?.date).format('DD/MM/YYYY')}
            </DialogTitle>
            <DialogDescription>Selecciona una o varias fechas para clonar los registros actuales.</DialogDescription>
          </DialogHeader>

          <div className="px-8 py-4">
            {/* Aquí va el calendario y las fechas seleccionadas */}
            <div className="space-y-4">
              <div className="rounded-md border border-input bg-background p-4">
                {/* <div className="text-sm font-medium mb-2">Selecciona fechas para clonar:</div> */}
                <div className="w-full">
                  <CalendarComponent
                    mode="multiple"
                    selected={fechasSeleccionadas}
                    onSelect={(dates: Date[] | undefined) => {
                      if (!dates) return;
                      // Actualizamos todas las fechas seleccionadas
                      setFechasSeleccionadas(dates);
                    }}
                    locale={es}
                    className="w-full"
                    classNames={{
                      months: 'w-full',
                      month: 'w-full',
                      caption: 'mb-4     text-center',
                      caption_label: 'text-sm font-medium',
                      nav: 'flex gap-1',
                      nav_button: 'h-7 w-7 p-0',
                      table: 'w-full',
                      head_row: 'flex w-full justify-between',
                      head_cell: 'text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] text-center',
                      row: 'flex w-full mt-2 justify-between',
                      cell: 'text-center text-sm p-0',
                      day: 'h-9 w-9 p-0 font-normal hover:bg-accent rounded-md',
                      day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
                      day_today: 'bg-accent text-accent-foreground',
                      day_outside: 'text-muted-foreground opacity-50',
                      day_disabled: 'text-muted-foreground opacity-50',
                      day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                      day_hidden: 'invisible',
                    }}
                  />
                </div>
              </div>

              {fechasSeleccionadas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Fechas seleccionadas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {fechasSeleccionadas.map((fecha) => (
                      <Badge key={fecha.toISOString()} variant="secondary" className="flex items-center gap-1">
                        {format(fecha, 'dd/MM/yyyy', { locale: es })}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFecha(fecha);
                          }}
                          className="ml-1 rounded-full text-xs hover:bg-muted"
                          aria-label="Eliminar fecha"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="ir-registros"
                checked={irARegistros}
                onCheckedChange={(checked) => setIrARegistros(checked as boolean)}
              />
              <Label htmlFor="ir-registros">Ir a los registros clonados al finalizar</Label>
            </div>
          </div>

          <DialogFooter className=" px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setFechasSeleccionadas([]);
                setLoading(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleClonar} disabled={loading} className="">
              {loading ? 'Clonando...' : 'Clonar registros'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
