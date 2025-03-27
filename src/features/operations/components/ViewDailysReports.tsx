'use client';

import InfoComponent from '@/components/InfoComponent';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import DailyReport from '@/features/operations/components/DailyReport';
import ReportFilters from '@/features/operations/components/ReportFilters';
import ReportsTable from '@/features/operations/components/ReportsTable';
import { useReportsList } from '@/features/operations/hooks/useReportsList';
import type { DailyReportData } from '@/features/operations/types/types';
import { endOfMonth, startOfMonth } from 'date-fns';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ViewDailysReports() {
  const {
    dailyReports,
    transformedReports,
    isLoading,
    currentPage,
    sortOrder,
    itemsPerPage,
    statusFilter,
    startDate,
    endDate,
    warningDialogOpen,
    currentReports,
    totalPages,
    setStartDate,
    setEndDate,
    setStatusFilter,
    loadReports,
    handlePageChange,
    handleItemsPerPageChange,
    handleSortChange,
    handleStatusChangeWithWarning,
    confirmStatusChange,
    setWarningDialogOpen,
  } = useReportsList();

  const [selectedReport, setSelectedReport] = useState<DailyReportData | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [allReport, setAllReport] = useState<DailyReportData[]>([]);
  const router = useRouter();

  // Inicializar fechas al inicio y fin del mes actual
  useEffect(() => {
    const now = new Date();
    setStartDate(startOfMonth(now));
    setEndDate(endOfMonth(now));
  }, []);

  // Cargar reportes al montar el componente o cuando cambia el modal
  useEffect(() => {
    loadReports();
  }, [openModal]);

  const handleViewReport = (report: DailyReportData) => {
    try {
      const fullReportData = transformedReports.find((r) => r.id === report.id);
      if (!fullReportData) {
        throw new Error('Report not found in the array');
      }
      setAllReport(transformedReports);
      setSelectedReport(fullReportData);
      setOpenModal(true);
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los detalles del reporte.',
        variant: 'destructive',
      });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedReport(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todos los Partes Diarios</h1>

      {/* Filtros */}
      <ReportFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        itemsPerPage={itemsPerPage}
        handleItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Tabla de reportes */}
      {isLoading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <ReportsTable
          currentReports={currentReports}
          sortOrder={sortOrder}
          handleSortChange={handleSortChange}
          handleStatusChangeWithWarning={handleStatusChangeWithWarning}
          handleViewReport={handleViewReport}
          isLoading={isLoading}
          totalPages={totalPages}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      )}

      {/* Modal para ver reporte completo */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Parte Diario</DialogTitle>
            <DialogDescription className="flex items-center space-x-4">
              <span>Fecha: {selectedReport?.date ? moment(selectedReport.date).format('DD/MM/YYYY') : ''}</span>
              <div className="grid grid-cols-3 y gap-4 w-full">
                <div className="col-span-1 flex">
                  <InfoComponent size="sm" message={`Los empleados no afectados y sin diagrama no se muestran.`} />
                </div>
                <div className="col-span-1 flex">
                  <InfoComponent size="sm" message={`Los clientes dados de baja no se muestran.`} />
                </div>
                <div className="col-span-1 flex">
                  <InfoComponent size="sm" message={`Los servicios vencidos o de baja no se muestran.`} />
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-auto">
            {selectedReport ? (
              <DailyReport reportData={selectedReport} allReport={allReport} />
            ) : (
              <div className="text-center">Cargando detalles del reporte...</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para cerrar reporte */}
      <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advertencia</DialogTitle>
            <DialogDescription>
              Si cambias el estado a cerrado, no podrás editar este reporte ni cambiar su estado nuevamente a abierto.
              ¿Deseas continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmStatusChange}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
