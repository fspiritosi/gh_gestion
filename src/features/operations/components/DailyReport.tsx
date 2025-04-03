'use client';

import BtnXlsDownload from '@/components/BtnXlsDownload';
import {
  getCustomerName,
  getEmployeeNames,
  getEquipmentNames,
  getItemName,
  getServiceName,
} from '@/components/DailyReport/utils/utils';
import DailyReportSkeleton from '@/components/Skeletons/DayliReportSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import DailyReportForm from '@/features/operations/components/DailyReportForm';
import { dailyColumns } from '@/features/operations/components/ui/DailyReportColumns';
import { TypesOfCheckListTable } from '@/features/operations/components/ui/data-table-dily-report';
import { useDailyReport } from '@/features/operations/hooks/useDailyReport';
import { useDailyReportActions } from '@/features/operations/hooks/useDailyReportActions';
import { useDailyReportForm } from '@/features/operations/hooks/useDailyReportForm';
import type {
  Customers,
  DailyReportItem,
  DailyReportProps,
  RepairsSolicituds,
  Services,
} from '@/features/operations/types/types';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import DocumentView from './DocumentView';
import GenericDialog from './GenericDialog';

export default function DailyReport({ reportData, allReport }: DailyReportProps) {
  const {
    companyName,
    employees,
    customers,
    services,
    items,
    equipment,
    diagram,
    dailyReport,
    setDailyReport,
    isLoading,
  } = useDailyReport(reportData || { id: '', date: '', status: false, dailyreportrows: [] });
  const [selectedCustomer, setSelectedCustomer] = useState<Customers | null>(null);
  const [selectedService, setSelectedService] = useState<Services | null>(null);
  const {
    handleEdit: handleEditAction,
    handleDelete: handleDeleteAction,
    isEditing,
    editingId,
    editingData,
    setIsEditing,
    setEditingId,
  } = useDailyReportActions(dailyReport, setDailyReport);

  const {
    saveDailyReport,
    updateDailyReport,
    reprogramarReporte,
    isDialogOpen,
    setIsDialogOpen,
    futureReports,
    setFutureReports,
    selectedReport,
    setSelectedReport,
    selectedDate,
    setSelectedDate,
    handleCloseDialog,
    handleValueChange,
    isLoadingReports,
    loadFutureReports,
    handleSaveToDailyReport,
    handleCreateNewReport,
    setEditingId: setFormEditingId,
    editingId: formEditingId,
  } = useDailyReportForm(dailyReport, setDailyReport, reportData?.id || '');

  const [reportStatus, setReportStatus] = useState<boolean>(reportData?.status || false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectRow, setSelectRow] = useState<string | null>(null);
  const [repairOrders, setRepairOrders] = useState<RepairsSolicituds[]>([]);
  const [date, setDate] = useState<Date | undefined>(() => {
    if (reportData && reportData.date) {
      return new Date(reportData.date);
    }
    return undefined;
  });
  const [existingReportId, setExistingReportId] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isDialogOpen2, setIsDialogOpen2] = useState(false);
  const [filaId, setFilaId] = useState<string | null>(null);
  const [filteredRow, setFilteredRow] = useState<DailyReportItem | null>(null);
  const supabase = supabaseBrowser();
  const URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { toast } = useToast();

  useEffect(() => {
    if (reportData) {
      setDate(new Date(reportData.date));
      setEditingId(reportData.id);
      setDailyReport(
        reportData.dailyreportrows?.map((row) => ({
          ...row,
          daily_report_id: reportData.id,
        }))
      );
      setReportStatus(reportData.status);
      setExistingReportId(reportData.id);
    }
  }, [reportData]);

  async function fetchDocument(document_path: string) {
    const { data: url } = supabase.storage.from('daily-reports').getPublicUrl(document_path);
    setDocumentUrl(url.publicUrl);
    return url.publicUrl;
  }

  const handleViewDocument = async (documentPath: string, row_id?: string) => {
    const filteredRow = dailyReport.find((row) => row.id === row_id);
    setFilteredRow(filteredRow as DailyReportItem);
    const url = await fetchDocument(documentPath);
    setDocumentUrl(url);
    setFilaId(row_id || null);
    setIsDialogOpen2(true);
  };

  const closeDialog2 = () => {
    setIsDialogOpen2(false);
    setDocumentUrl(null);
  };

  const handleAddNewRow = () => {
    setEditingId(null);
    setIsEditing(true);
  };

  // Modificar la función handleEdit para mejorar la secuencia de edición
  const handleEdit = async (id: string) => {
    console.log('Editando fila con ID:', id);

    // Primero, limpiar cualquier estado de edición anterior
    setIsEditing(false);
    setEditingId(null);

    // Esperar un momento para asegurar que los estados se han limpiado
    setTimeout(() => {
      // Luego iniciar la edición
      const itemToEdit = dailyReport.find((item) => item.id === id);
      console.log('Datos de la fila a editar:', itemToEdit);
      handleEditAction(id);
    }, 100);
  };

  const handleConfirmOpen = (id: string) => {
    setSelectRow(id);
    setConfirmDelete(true);
  };

  const handleConfirmClose = () => {
    setConfirmDelete(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/daily-report/daily-report-row?id=${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al obtener el estado de la fila: ${errorText}`);
      }

      const rowData = await response.json();

      const { dailyreportrows } = rowData;
      const row = dailyreportrows.find((item: any) => item.id === id);

      if (!row) {
        throw new Error('Fila no encontrada');
      }

      const { status } = row;

      if (status !== 'pendiente') {
        toast({
          title: 'Error',
          description: "Solo se pueden eliminar filas con estado 'pendiente'.",
          variant: 'destructive',
        });
        return;
      }

      // Usar la función del hook para eliminar
      await handleDeleteAction(id);
    } catch (error) {
      console.error('Error al eliminar la fila:', error);
      toast({
        title: 'Error',
        description: `Hubo un problema al eliminar la fila: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (data: any) => {
    let success: boolean | undefined;

    if (editingId) {
      success = await updateDailyReport(data, editingId, existingReportId || '');
    } else {
      success = await saveDailyReport(data);
    }

    if (success === true) {
      setIsEditing(false);
      setEditingId(null);
    }
  };

  const handleFormCancel = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  // Modificar la función handleStatusChange para mostrar correctamente los reportes futuros
  const handleStatusChange = (value: string) => {
    console.log('Estado seleccionado en DailyReport:', value);
    if (value === 'reprogramado' && editingId) {
      const currentReport = dailyReport.find((report: DailyReportItem) => report.id === editingId);

      if (currentReport) {
        console.log('Reporte actual:', currentReport);
        console.log('Fecha del reporte actual:', reportData?.date);

        // Cargar reportes futuros directamente
        if (reportData?.date) {
          // Asegurarse de que la fecha esté en formato ISO
          const formattedDate = new Date(reportData.date).toISOString();
          console.log('Cargando reportes futuros con fecha:', formattedDate);

          // Importante: Establecer el ID de edición en el hook del formulario
          setFormEditingId(editingId);

          loadFutureReports(formattedDate);
          setSelectedReport(currentReport as any);
          setIsDialogOpen(true);
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo determinar la fecha del reporte actual',
            variant: 'destructive',
          });
        }
      }
    } else if (value === 'ejecutado' && editingId) {
      // Importante: Establecer el ID de edición en el hook del formulario
      setFormEditingId(editingId);
      setIsDialogOpen(true);
    }
  };

  // Obtener la fecha actual
  const currentDate = new Date();

  // Función para calcular la diferencia de días
  const calculateDateDifference = (dateString: string) => {
    const reportDate = new Date(dateString);
    const timeDifference = currentDate.getTime() - reportDate.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);
    return dayDifference;
  };

  const dayDifference = calculateDateDifference(reportData?.date || '');
  const canEdit = dayDifference <= 6;

  function createDataToDownload(data: DailyReportItem[]) {
    const dataToDownload = data.map((report: DailyReportItem) => ({
      Fecha: report.date,
      Cliente: report.customer ? getCustomerName(report.customer, customers) : 'N/A',
      Servicio: report.services ? getServiceName(report.services, services) : 'N/A',
      Item: report.item ? getItemName(report.item, items) : 'N/A',
      Empleados: Array.isArray(report.employees) ? getEmployeeNames(report.employees, employees) : 'N/A',
      Equipos: Array.isArray(report.equipment) ? getEquipmentNames(report.equipment, equipment) : 'N/A',
      Jornada: report.working_day,
      'Hora de Inicio': report.start_time,
      'Hora de Fin': report.end_time,
      Estado: report.status,
      Descripción: report.description,
    }));
    return dataToDownload;
  }

  if (isLoading) {
    return <DailyReportSkeleton />;
  }

  return (
    <div className="mx-auto p-4">
      <div className="relative w-full h-full overflow-hidden">
        <motion.div className="flex w-full" animate={{ height: 'auto' }} transition={{ duration: 0.3 }}>
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '23%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pr-4 overflow-hidden"
              >
                <DailyReportForm
                  editingId={editingId}
                  initialData={editingData}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                  customers={customers}
                  services={services}
                  items={items}
                  employees={employees}
                  equipment={equipment}
                  reportDate={reportData?.date || ''}
                  diagram={diagram}
                  isDialogOpen={isDialogOpen}
                  handleCloseDialog={handleCloseDialog}
                  futureReports={futureReports}
                  selectedDate={selectedDate || ''}
                  setSelectedDate={setSelectedDate}
                  handleSaveToDailyReport={handleSaveToDailyReport}
                  setIsDialogOpen={setIsDialogOpen}
                  onCreateNewReport={handleCreateNewReport}
                  isLoadingReports={isLoadingReports}
                  handleStatusChange={handleStatusChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            animate={{ width: isEditing ? '77%' : '100%' }}
            transition={{ duration: 0.3 }}
            className="overflow-x-auto"
          >
            {canEdit && (
              <div className="flex justify-end items-center mb-4">
                <Button onClick={handleAddNewRow} className="items-end">
                  <PlusCircledIcon className="mr-2 h-4 w-4" />
                  Agregar Fila
                </Button>
              </div>
            )}

            <TypesOfCheckListTable
              columns={dailyColumns(
                handleViewDocument,
                handleEdit,
                handleConfirmOpen,
                canEdit as any,
                customers,
                services,
                items,
                companyName as any
              )}
              data={dailyReport || ''}
              customers={customers}
              services={services}
              items={items}
              employees={employees}
              equipment={equipment}
              companyName={companyName || ''}
              handleViewDocument={(documentPath: string, row_id?: string): Promise<void> => {
                throw new Error('Function not implemented.');
              }}
            />
            <BtnXlsDownload
              fn={createDataToDownload}
              dataToDownload={dailyReport}
              nameFile={`'Parte_Diario'${reportData?.date}`}
            />
          </motion.div>
        </motion.div>
      </div>
      <GenericDialog isOpen={isDialogOpen2} onClose={closeDialog2} title="" description="">
        <Card className="mb-2 w-full max-w-5xl mx-auto h-[85vh]">
          <CardDescription className="p-3 flex justify-center items-center h-full">
            <DocumentView
              rowId={filaId || ''}
              row={(filteredRow as DailyReportItem) || ''}
              documentUrl={documentUrl || ''}
              customerName={getCustomerName(selectedCustomer?.id || '', customers)}
              companyName={companyName || ''}
              serviceName={getServiceName(selectedService?.id || '', services)}
              itemNames={getItemName(selectedService?.item_id || '', items)}
              employeeNames={filteredRow?.employees.map((emp: string) => getEmployeeNames([emp], employees))}
              equipmentNames={filteredRow?.equipment.map((eq: string) => getEquipmentNames([eq], equipment))}
            />
          </CardDescription>
        </Card>
      </GenericDialog>
      {confirmDelete && (
        <div>
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogContent className="w-full max-w-fit mx-auto p-2 flex flex-col items-center">
              <DialogTitle className="text-xl font-semibold mb-4">Confirmar Eliminación</DialogTitle>
              <DialogDescription className="text-center mb-4">
                ¿Estás seguro de que deseas eliminar esta fila?
              </DialogDescription>
              <div className="flex justify-center mt-2 space-x-2">
                <Button onClick={handleConfirmClose} className="mr-2">
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    handleDelete(selectRow as any);
                    handleConfirmClose();
                  }}
                  variant="destructive"
                >
                  Eliminar
                </Button>
              </div>
            </DialogContent>
            <DialogFooter className="flex justify-center">
              <Button onClick={handleConfirmClose} variant="outline">
                Cerrar
              </Button>
            </DialogFooter>
          </Dialog>
        </div>
      )}
    </div>
  );
}
