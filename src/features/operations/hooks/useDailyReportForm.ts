'use client';

import type React from 'react';

import { toast } from '@/components/ui/use-toast';
import type { DailyReportItem } from '@/features/operations/types/types';
import cookies from 'js-cookie';
import moment from 'moment';
import { useState } from 'react';

export function useDailyReportForm(
  dailyReport: DailyReportItem[],
  setDailyReport: React.Dispatch<React.SetStateAction<DailyReportItem[]>>,
  reportId: string
) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [futureReports, setFutureReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReportItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentRowData, setCurrentRowData] = useState<DailyReportItem | null>(null);

  const formatTime = (time: string): string => {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Función para cargar reportes futuros
  const loadFutureReports = async (currentReportDate: string) => {
    setIsLoadingReports(true);
    try {
      console.log('Cargando reportes futuros...');

      // Obtener company_id de cookies o localStorage
      const company_id = cookies.get('actualComp') || localStorage.getItem('actualComp') || '';
      if (!company_id) {
        console.error('No se pudo obtener el company_id');
        toast({
          title: 'Error',
          description: 'No se pudo obtener el ID de la compañía',
          variant: 'destructive',
        });
        setFutureReports([]);
        setIsLoadingReports(false);
        return;
      }

      console.log('Company ID:', company_id);

      // Asegurarse de que la fecha esté en formato correcto
      const parsedDate = new Date(currentReportDate);
      const formattedDate = parsedDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      console.log('Fecha actual del reporte (formateada):', formattedDate);

      // Intentar obtener todos los reportes
      const response = await fetch(`/api/daily-report/?actual=${company_id}`);

      if (!response.ok) {
        console.error(`Error HTTP: ${response.status} - ${response.statusText}`);

        // Intentar con URL absoluta si la relativa falla
        const URL = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
        console.log('Intentando con URL absoluta:', `${URL}/api/daily-report/?actual=${company_id}`);

        const absoluteResponse = await fetch(`${URL}/api/daily-report/?actual=${company_id}`);
        if (!absoluteResponse.ok) {
          throw new Error(`Error al obtener los partes diarios: ${absoluteResponse.status}`);
        }

        const data = await absoluteResponse.json();
        processReportsData(data, parsedDate);
      } else {
        const data = await response.json();
        processReportsData(data, parsedDate);
      }
    } catch (error) {
      console.error('Error al cargar reportes futuros:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los partes diarios futuros',
        variant: 'destructive',
      });

      // Crear algunos reportes futuros de prueba para depuración
      createTestFutureReports();
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Función auxiliar para procesar los datos de reportes
  const processReportsData = (data: any, currentDate: Date) => {
    console.log('Datos recibidos de la API:', data);

    // Verificar la estructura esperada { dailyReports: [...] }
    if (!data || !data.dailyReports || !Array.isArray(data.dailyReports)) {
      console.error('La respuesta no tiene la estructura esperada { dailyReports: [...] }');
      setFutureReports([]);
      return;
    }

    // Normalizar la fecha actual para comparación
    const normalizedCurrentDate = new Date(currentDate);
    normalizedCurrentDate.setHours(0, 0, 0, 0);

    // Filtrar reportes futuros
    const filtered = data.dailyReports.filter((report: any) => {
      if (!report.date) return false;

      const reportDate = new Date(report.date);
      reportDate.setHours(0, 0, 0, 0);

      return reportDate > normalizedCurrentDate;
    });

    // Ordenar por fecha ascendente
    filtered.sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    console.log(`Se encontraron ${filtered.length} reportes futuros`);
    console.log('Reportes futuros ordenados:', filtered);

    setFutureReports(filtered);

    // Si no hay reportes futuros, crear algunos de prueba (solo en desarrollo)
    if (filtered.length === 0 && process.env.NODE_ENV === 'development') {
      console.log('No se encontraron reportes futuros. Creando reportes de prueba...');
      createTestFutureReports();
    }
  };

  // Función para crear reportes futuros de prueba (solo para depuración)
  const createTestFutureReports = () => {
    const testReports = [];
    const today = new Date();

    // Crear 3 reportes futuros de prueba
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);

      testReports.push({
        id: `test-${i}`,
        date: futureDate.toISOString().split('T')[0],
        status: true,
        company_id: cookies.get('actualComp') || localStorage.getItem('actualComp') || '',
      });
    }

    console.log('Reportes futuros de prueba creados:', testReports);
    setFutureReports(testReports);
  };

  const saveDailyReport = async (data: any): Promise<boolean> => {
    try {
      const formattedStartTime = formatTime(data.start_time);
      const formattedEndTime = formatTime(data.end_time);

      // Obtener el array de filas existentes, asegurándonos de que sea un array
      const existingRows = Array.isArray(dailyReport) ? dailyReport : [];

      // Verificar si ya existe una fila exactamente igual
      const isDuplicate = existingRows.some(
        (row) =>
          row.customer === data.customer &&
          row.services === data.services &&
          row.item === data.item &&
          row.working_day === data.working_day &&
          row.start_time === formattedStartTime &&
          row.end_time === formattedEndTime &&
          row.description === data.description &&
          row.status === data.status &&
          JSON.stringify(row.employees) === JSON.stringify(data.employees) &&
          JSON.stringify(row.equipment) === JSON.stringify(data.equipment)
      );

      if (isDuplicate) {
        toast({
          title: 'Error',
          description: 'Ya existe una fila con los mismos datos.',
          variant: 'destructive',
        });
        return false; // Salir de la función si ya existe una fila igual
      }

      const rowResponse = await fetch('/api/daily-report/daily-report-row', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily_report_id: reportId,
          customer_id: data.customer,
          service_id: data.services,
          item_id: data.item,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          description: data.description,
          status: data.status,
        }),
      });

      if (!rowResponse.ok) {
        const errorText = await rowResponse.text();
        throw new Error(`Error al insertar la fila en dailyreportrow: ${errorText}`);
      }

      const { data: rowData } = await rowResponse.json();
      const rowId = rowData[0].id;

      if (data.employees && data.employees.length > 0) {
        await fetch('/api/daily-report/dailyreportemployeerelations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            data.employees.map((employee_id: string) => ({
              daily_report_row_id: rowId,
              employee_id: employee_id,
            }))
          ),
        });
      }

      if (data.equipment && data.equipment.length > 0) {
        await fetch('/api/daily-report/dailyreportequipmentrelations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            data.equipment.map((equipment_id: string) => ({
              daily_report_row_id: rowId,
              equipment_id: equipment_id,
            }))
          ),
        });
      }

      setDailyReport((prevReport) => {
        // Verificar que prevReport sea un array
        if (!Array.isArray(prevReport)) {
          prevReport = [];
        }

        return [
          ...prevReport,
          {
            id: rowId,
            date: data.date || '',
            working_day: data.working_day,
            customer: data.customer,
            employees: data.employees,
            equipment: data.equipment,
            services: data.services,
            item: data.item,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            status: data.status,
            description: data.description,
            document_path: data.document_path,
          },
        ];
      });

      toast({
        title: 'Éxito',
        description: 'Fila agregada correctamente al parte diario.',
      });

      return true;
    } catch (error) {
      console.error('Error al procesar el parte diario:', error);
      toast({
        title: 'Error',
        description: `Hubo un problema al procesar el parte diario: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateDailyReport = async (data: any, rowId: string, existingReportId: string): Promise<boolean> => {
    try {
      if (data.working_day === 'jornada 8 horas' || data.working_day === 'jornada 12 horas') {
        data.start_time = '';
        data.end_time = '';
      }

      const formattedStartTime = formatTime(data.start_time);
      const formattedEndTime = formatTime(data.end_time);

      // Actualizar la fila existente
      const rowResponse = await fetch(`/api/daily-report/daily-report-row?id=${rowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily_report_id: existingReportId,
          customer_id: data.customer,
          service_id: data.services,
          item_id: data.item,
          working_day: data.working_day,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          description: data.description,
          status: data.status,
        }),
      });

      if (!rowResponse.ok) {
        const errorText = await rowResponse.text();
        throw new Error(`Error al actualizar la fila en dailyreportrow: ${errorText}`);
      }

      // Obtener relaciones actuales de empleados
      const employeeRelationsResponse = await fetch(`/api/daily-report/dailyreportemployeerelations?row_id=${rowId}`);
      if (!employeeRelationsResponse.ok) {
        const errorText = await employeeRelationsResponse.text();
        throw new Error(`Error al obtener relaciones de empleados: ${errorText}`);
      }
      const employeeRelationsData = await employeeRelationsResponse.json();

      const currentEmployees = employeeRelationsData.dailyreportemployeerelations.map((rel: any) => ({
        id: rel.id,
        employee_id: rel.employee_id,
      }));

      // Obtener relaciones actuales de equipos
      const equipmentRelationsResponse = await fetch(`/api/daily-report/dailyreportequipmentrelations?row_id=${rowId}`);
      if (!equipmentRelationsResponse.ok) {
        const errorText = await equipmentRelationsResponse.text();
        throw new Error(`Error al obtener relaciones de equipos: ${errorText}`);
      }
      const equipmentRelationsData = await equipmentRelationsResponse.json();

      const currentEquipment = equipmentRelationsData.dailyreportequipmentrelations.map((rel: any) => ({
        id: rel.id,
        equipment_id: rel.equipment_id,
      }));

      // Determinar relaciones a eliminar
      const employeesToRemove = currentEmployees.filter((rel: any) => !data.employees?.includes(rel.employee_id));
      const equipmentToRemove = currentEquipment.filter((rel: any) => !data.equipment?.includes(rel.equipment_id));

      // Eliminar relaciones no utilizadas
      if (employeesToRemove.length > 0) {
        await fetch('/api/daily-report/dailyreportemployeerelations', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            daily_report_row_id: rowId,
            employees: employeesToRemove.map((rel: any) => ({ id: rel.id, employee_id: rel.employee_id })),
          }),
        });
      }

      if (equipmentToRemove.length > 0) {
        await fetch('/api/daily-report/dailyreportequipmentrelations', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            daily_report_row_id: rowId,
            equipment: equipmentToRemove.map((rel: any) => ({ id: rel.id, equipment_id: rel.equipment_id })),
          }),
        });
      }

      // Verificar relaciones existentes antes de actualizar
      const existingRelationEmployeeResponse = await fetch(
        `/api/daily-report/dailyreportemployeerelations/check-employee`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rowId: rowId,
            employees: data.employees,
          }),
        }
      );
      const existingEmployee = await existingRelationEmployeeResponse.json();

      // Actualizar relaciones con nuevos datos
      if (data.employees && !existingEmployee.exists && data.employees.length > 0) {
        await fetch('/api/daily-report/dailyreportemployeerelations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            data.employees.map((employee_id: string) => ({
              daily_report_row_id: rowId,
              employee_id: employee_id,
            }))
          ),
        });
      }

      // Verificar relaciones existentes antes de actualizar
      const existingRelationEquipmentResponse = await fetch(
        `/api/daily-report/dailyreportequipmentrelations/check-equipment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rowId: rowId,
            equipment: data.equipment,
          }),
        }
      );
      const existingEquipment = await existingRelationEquipmentResponse.json();

      if (data.equipment && !existingEquipment.exists && data.equipment.length > 0) {
        await fetch('/api/daily-report/dailyreportequipmentrelations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            data.equipment.map((equipment_id: string) => ({
              daily_report_row_id: rowId,
              equipment_id: equipment_id,
            }))
          ),
        });
      }

      setDailyReport((prevReport) =>
        prevReport.map((report) =>
          report.id === rowId
            ? {
                ...report,
                customer: data.customer,
                employees: data.employees,
                equipment: data.equipment,
                services: data.services,
                item: data.item,
                working_day: data.working_day,
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                status: data.status,
                description: data.description,
                document_path: data.document_path,
              }
            : report
        )
      );

      toast({
        title: 'Éxito',
        description: 'Fila actualizada correctamente en el parte diario.',
      });

      return true;
    } catch (error) {
      console.error('Error al actualizar el parte diario:', error);
      toast({
        title: 'Error',
        description: `Hubo un problema al actualizar el parte diario: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Función reprogramarReporte mejorada
  const reprogramarReporte = async (
    rowData: DailyReportItem, // Datos completos de la fila a reprogramar
    originalRowId: string, // ID de la fila original
    targetReportId: string // ID del reporte destino
  ): Promise<boolean> => {
    try {
      console.log('Iniciando reprogramación...', {
        rowData,
        originalRowId,
        targetReportId,
      });

      // Validación de datos esenciales
      if (!rowData || !originalRowId || !targetReportId) {
        throw new Error('Datos incompletos para la reprogramación');
      }

      // Formatear tiempos si existen
      const formattedStartTime = rowData.start_time ? formatTime(rowData.start_time) : '';
      const formattedEndTime = rowData.end_time ? formatTime(rowData.end_time) : '';

      // 1. Crear nueva fila en el reporte destino
      console.log('Creando nueva fila en el reporte destino...');
      const newRowResponse = await fetch(`/api/daily-report/daily-report-row`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily_report_id: targetReportId,
          customer_id: rowData.customer,
          service_id: rowData.services,
          item_id: rowData.item,
          working_day: rowData.working_day,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          description: `Reprogramado desde ${moment(rowData.date).format('DD/MM/YYYY')}`,
          status: 'pendiente', // Nuevo estado
        }),
      });

      if (!newRowResponse.ok) {
        const errorText = await newRowResponse.text();
        throw new Error(`Error al crear nueva fila: ${errorText}`);
      }

      const { data: newRowData } = await newRowResponse.json();
      const newRowId = newRowData?.[0]?.id;

      if (!newRowId) {
        throw new Error('No se recibió un ID válido para la nueva fila');
      }

      console.log('Nueva fila creada con ID:', newRowId);

      // 2. Actualizar fila original como "reprogramado"
      console.log('Actualizando fila original...');
      const updateResponse = await fetch(`/api/daily-report/daily-report-row?id=${originalRowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'reprogramado',
          description: `Reprogramado a ${moment().add(1, 'days').format('DD/MM/YYYY')}`,
        }),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Error al actualizar fila original: ${errorText}`);
      }

      // 3. Copiar relaciones de empleados
      if (rowData.employees?.length > 0) {
        console.log('Copiando relaciones de empleados...');
        const employeeRelationsResponse = await fetch('/api/daily-report/dailyreportemployeerelations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            rowData.employees.map((employeeId) => ({
              daily_report_row_id: newRowId,
              employee_id: employeeId,
            }))
          ),
        });

        if (!employeeRelationsResponse.ok) {
          console.error('Error al copiar empleados:', await employeeRelationsResponse.text());
        }
      }

      // 4. Copiar relaciones de equipos
      if (rowData.equipment?.length > 0) {
        console.log('Copiando relaciones de equipos...');
        const equipmentRelationsResponse = await fetch('/api/daily-report/dailyreportequipmentrelations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            rowData.equipment.map((equipmentId) => ({
              daily_report_row_id: newRowId,
              equipment_id: equipmentId,
            }))
          ),
        });

        if (!equipmentRelationsResponse.ok) {
          console.error('Error al copiar equipos:', await equipmentRelationsResponse.text());
        }
      }

      // 5. Actualizar estado local
      setDailyReport((prev) =>
        prev.map((row) =>
          row.id === originalRowId
            ? {
                ...row,
                status: 'reprogramado',
                description: `Reprogramado a ${moment().add(1, 'days').format('DD/MM/YYYY')}`,
              }
            : row
        )
      );

      toast({
        title: 'Éxito',
        description: 'Fila reprogramada correctamente',
      });

      return true;
    } catch (error) {
      console.error('Error en reprogramarReporte:', error);
      toast({
        title: 'Error',
        description: `Error al reprogramar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Función handleValueChange mejorada
  const handleValueChange = (value: string, currentReportDate: string, id: string) => {
    console.log('Estado seleccionado en useDailyReportForm:', value);
    console.log('Fecha del reporte actual:', currentReportDate);
    console.log('ID de la fila:', id);

    if (value === 'reprogramado' || value === 'ejecutado') {
      // Guardar el ID de la fila que se está editando
      setEditingId(id);

      // Buscar y guardar los datos completos de la fila
      const rowData = dailyReport.find((row) => row.id === id);
      if (rowData) {
        setCurrentRowData(rowData);
        console.log('Datos de la fila a reprogramar:', rowData);
      } else {
        console.error('No se encontraron datos para la fila con ID:', id);
      }

      if (value === 'reprogramado') {
        // Cargar reportes futuros
        if (currentReportDate) {
          loadFutureReports(currentReportDate);
        } else {
          console.error('No se proporcionó una fecha válida para cargar reportes futuros');
          // Usar la fecha actual como fallback
          loadFutureReports(new Date().toISOString());
        }
      }
      setIsDialogOpen(true);
    }
  };

  // Función mejorada para guardar al parte diario
  const handleSaveToDailyReport = async (options?: {
    newReportId?: string;
    newReportDate?: string;
  }): Promise<boolean> => {
    const targetReportId = options?.newReportId || selectedDate;

    console.log('Iniciando handleSaveToDailyReport con:', {
      targetReportId,
      editingId,
      currentRowData,
    });

    if (!dailyReport || !Array.isArray(dailyReport) || dailyReport.length === 0) {
      toast({
        title: 'Error',
        description: 'No hay datos de reportes disponibles',
        variant: 'destructive',
      });
      return false;
    }

    if (!editingId) {
      toast({
        title: 'Error',
        description: 'No se ha identificado la fila a reprogramar',
        variant: 'destructive',
      });
      return false;
    }

    if (!targetReportId) {
      toast({
        title: 'Error',
        description: 'No se ha seleccionado un parte diario destino',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Buscar la fila a reprogramar si no la tenemos ya
      const rowToReprogram = currentRowData || dailyReport.find((row) => row.id === editingId);

      if (!rowToReprogram) {
        throw new Error('Fila a reprogramar no encontrada');
      }

      // Obtener la fecha del reporte destino
      const targetDate = options?.newReportDate || futureReports.find((r) => r.id === targetReportId)?.date;

      if (!targetDate) {
        throw new Error('No se pudo determinar la fecha destino');
      }

      console.log('Datos para reprogramación:', {
        rowData: rowToReprogram,
        targetReportId,
        targetDate,
      });

      const success = await reprogramarReporte(
        {
          ...rowToReprogram,
          date: targetDate,
          description: `Reprogramado desde ${moment(rowToReprogram.date).format('DD/MM/YYYY')}`,
        },
        editingId,
        targetReportId
      );

      if (success) {
        setIsDialogOpen(false);
        setSelectedDate(null);
        setEditingId(null);
        setCurrentRowData(null);

        toast({
          title: 'Éxito',
          description: `Fila reprogramada para ${moment(targetDate).format('DD/MM/YYYY')}`,
        });
      }
      return success;
    } catch (error) {
      console.error('Error en handleSaveToDailyReport:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al reprogramar',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Función para crear un nuevo reporte
  const handleCreateNewReport = async (date: string) => {
    try {
      console.log('Creando nuevo reporte para fecha:', date);
      const company_id = cookies.get('actualComp');
      if (!company_id) throw new Error('No se pudo obtener company_id');

      const response = await fetch('/api/daily-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          company_id,
          status: true,
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      const { data } = await response.json();
      const newReportId = data[0]?.id;

      if (!newReportId) throw new Error('No se recibió ID del nuevo reporte');

      console.log('Nuevo reporte creado con ID:', newReportId);
      return newReportId;
    } catch (error) {
      console.error('Error al crear reporte:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear reporte',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
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
    setEditingId,
    editingId,
  };
}
