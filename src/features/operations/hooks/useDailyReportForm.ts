"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import type { DailyReportItem } from "@/features/operations/types/types"

export function useDailyReportForm(
  dailyReport: DailyReportItem[],
  setDailyReport: React.Dispatch<React.SetStateAction<DailyReportItem[]>>,
  reportId: string,
) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [futureReports, setFutureReports] = useState<any[]>([])
  const [selectedReport, setSelectedReport] = useState<DailyReportItem | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const formatTime = (time: string): string => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const saveDailyReport = async (data: any): Promise<boolean> => {
    try {
      const formattedStartTime = formatTime(data.start_time)
      const formattedEndTime = formatTime(data.end_time)

      // Obtener el array de filas existentes, asegurándonos de que sea un array
      const existingRows = Array.isArray(dailyReport) ? dailyReport : []

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
          JSON.stringify(row.equipment) === JSON.stringify(data.equipment),
      )

      if (isDuplicate) {
        toast({
          title: "Error",
          description: "Ya existe una fila con los mismos datos.",
          variant: "destructive",
        })
        return false // Salir de la función si ya existe una fila igual
      }

      const rowResponse = await fetch("/api/daily-report/daily-report-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      })

      if (!rowResponse.ok) {
        const errorText = await rowResponse.text()
        throw new Error(`Error al insertar la fila en dailyreportrow: ${errorText}`)
      }

      const { data: rowData } = await rowResponse.json()
      const rowId = rowData[0].id

      if (data.employees && data.employees.length > 0) {
        await fetch("/api/daily-report/dailyreportemployeerelations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            data.employees.map((employee_id: string) => ({
              daily_report_row_id: rowId,
              employee_id: employee_id,
            })),
          ),
        })
      }

      if (data.equipment && data.equipment.length > 0) {
        await fetch("/api/daily-report/dailyreportequipmentrelations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            data.equipment.map((equipment_id: string) => ({
              daily_report_row_id: rowId,
              equipment_id: equipment_id,
            })),
          ),
        })
      }

      setDailyReport((prevReport) => {
        // Verificar que prevReport sea un array
        if (!Array.isArray(prevReport)) {
          prevReport = []
        }

        return [
          ...prevReport,
          {
            id: rowId,
            date: data.date || "",
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
        ]
      })

      toast({
        title: "Éxito",
        description: "Fila agregada correctamente al parte diario.",
      })

      return true
    } catch (error) {
      console.error("Error al procesar el parte diario:", error)
      toast({
        title: "Error",
        description: `Hubo un problema al procesar el parte diario: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      return false
    }
  }

  const updateDailyReport = async (data: any, rowId: string, existingReportId: string): Promise<boolean> => {
    try {
      if (data.working_day === "jornada 8 horas" || data.working_day === "jornada 12 horas") {
        data.start_time = ""
        data.end_time = ""
      }

      const formattedStartTime = formatTime(data.start_time)
      const formattedEndTime = formatTime(data.end_time)

      // Actualizar la fila existente
      const rowResponse = await fetch(`/api/daily-report/daily-report-row?id=${rowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
      })

      if (!rowResponse.ok) {
        const errorText = await rowResponse.text()
        throw new Error(`Error al actualizar la fila en dailyreportrow: ${errorText}`)
      }

      // Obtener relaciones actuales de empleados
      const employeeRelationsResponse = await fetch(`/api/daily-report/dailyreportemployeerelations?row_id=${rowId}`)
      if (!employeeRelationsResponse.ok) {
        const errorText = await employeeRelationsResponse.text()
        throw new Error(`Error al obtener relaciones de empleados: ${errorText}`)
      }
      const employeeRelationsData = await employeeRelationsResponse.json()

      const currentEmployees = employeeRelationsData.dailyreportemployeerelations.map((rel: any) => ({
        id: rel.id,
        employee_id: rel.employee_id,
      }))

      // Obtener relaciones actuales de equipos
      const equipmentRelationsResponse = await fetch(`/api/daily-report/dailyreportequipmentrelations?row_id=${rowId}`)
      if (!equipmentRelationsResponse.ok) {
        const errorText = await equipmentRelationsResponse.text()
        throw new Error(`Error al obtener relaciones de equipos: ${errorText}`)
      }
      const equipmentRelationsData = await equipmentRelationsResponse.json()

      const currentEquipment = equipmentRelationsData.dailyreportequipmentrelations.map((rel: any) => ({
        id: rel.id,
        equipment_id: rel.equipment_id,
      }))

      // Determinar relaciones a eliminar
      const employeesToRemove = currentEmployees.filter((rel: any) => !data.employees?.includes(rel.employee_id))
      const equipmentToRemove = currentEquipment.filter((rel: any) => !data.equipment?.includes(rel.equipment_id))

      // Eliminar relaciones no utilizadas
      if (employeesToRemove.length > 0) {
        await fetch("/api/daily-report/dailyreportemployeerelations", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            daily_report_row_id: rowId,
            employees: employeesToRemove.map((rel: any) => ({ id: rel.id, employee_id: rel.employee_id })),
          }),
        })
      }

      if (equipmentToRemove.length > 0) {
        await fetch("/api/daily-report/dailyreportequipmentrelations", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            daily_report_row_id: rowId,
            equipment: equipmentToRemove.map((rel: any) => ({ id: rel.id, equipment_id: rel.equipment_id })),
          }),
        })
      }

      // Verificar relaciones existentes antes de actualizar
      const existingRelationEmployeeResponse = await fetch(
        `/api/daily-report/dailyreportemployeerelations/check-employee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rowId: rowId,
            employees: data.employees,
          }),
        },
      )
      const existingEmployee = await existingRelationEmployeeResponse.json()

      // Actualizar relaciones con nuevos datos
      if (data.employees && !existingEmployee.exists && data.employees.length > 0) {
        await fetch("/api/daily-report/dailyreportemployeerelations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            data.employees.map((employee_id: string) => ({
              daily_report_row_id: rowId,
              employee_id: employee_id,
            })),
          ),
        })
      }

      // Verificar relaciones existentes antes de actualizar
      const existingRelationEquipmentResponse = await fetch(
        `/api/daily-report/dailyreportequipmentrelations/check-equipment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rowId: rowId,
            equipment: data.equipment,
          }),
        },
      )
      const existingEquipment = await existingRelationEquipmentResponse.json()

      if (data.equipment && !existingEquipment.exists && data.equipment.length > 0) {
        await fetch("/api/daily-report/dailyreportequipmentrelations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            data.equipment.map((equipment_id: string) => ({
              daily_report_row_id: rowId,
              equipment_id: equipment_id,
            })),
          ),
        })
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
            : report,
        ),
      )

      toast({
        title: "Éxito",
        description: "Fila actualizada correctamente en el parte diario.",
      })

      return true
    } catch (error) {
      console.error("Error al actualizar el parte diario:", error)
      toast({
        title: "Error",
        description: `Hubo un problema al actualizar el parte diario: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      return false
    }
  }

  const reprogramarReporte = async (data: any, rowId: string, newDailyReportId: string): Promise<boolean> => {
    try {
      const formattedStartTime = formatTime(data.start_time)
      const formattedEndTime = formatTime(data.end_time)

      // Crear una nueva fila en el nuevo parte diario
      const newRowResponse = await fetch(`/api/daily-report/daily-report-row`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          daily_report_id: newDailyReportId,
          customer_id: data.customer,
          service_id: data.services,
          item_id: data.item,
          working_day: data.working_day,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          description: `Reprogramado desde ${data.date}`,
          status: "pendiente",
        }),
      })

      if (!newRowResponse.ok) {
        const errorText = await newRowResponse.text()
        throw new Error(`Error al crear la nueva fila en dailyreportrow: ${errorText}`)
      }

      const { data: newRowData } = await newRowResponse.json()
      const newRowId = newRowData.id

      // Actualizar el estado de la fila original a "reprogramado"
      const updateRowResponse = await fetch(`/api/daily-report/daily-report-row?id=${rowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "reprogramado",
          description: `Reprogramado a ${data.date}`,
        }),
      })

      if (!updateRowResponse.ok) {
        const errorText = await updateRowResponse.text()
        throw new Error(`Error al actualizar la fila original en dailyreportrow: ${errorText}`)
      }

      // Obtener relaciones actuales de empleados
      const employeeRelationsResponse = await fetch(`/api/daily-report/dailyreportemployeerelations?row_id=${rowId}`)
      if (!employeeRelationsResponse.ok) {
        const errorText = await employeeRelationsResponse.text()
        throw new Error(`Error al obtener relaciones de empleados: ${errorText}`)
      }
      const employeeRelationsData = await employeeRelationsResponse.json()

      const currentEmployees = employeeRelationsData.dailyreportemployeerelations.map((rel: any) => ({
        id: rel.id,
        employee_id: rel.employee_id,
      }))

      // Obtener relaciones actuales de equipos
      const equipmentRelationsResponse = await fetch(`/api/daily-report/dailyreportequipmentrelations?row_id=${rowId}`)
      if (!equipmentRelationsResponse.ok) {
        const errorText = await equipmentRelationsResponse.text()
        throw new Error(`Error al obtener relaciones de equipos: ${errorText}`)
      }
      const equipmentRelationsData = await equipmentRelationsResponse.json()

      const currentEquipment = equipmentRelationsData.dailyreportequipmentrelations.map((rel: any) => ({
        id: rel.id,
        equipment_id: rel.equipment_id,
      }))

      // Crear nuevas relaciones de empleados para la nueva fila
      if (currentEmployees.length > 0) {
        await fetch("/api/daily-report/dailyreportemployeerelations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            currentEmployees.map((employee: any) => ({
              daily_report_row_id: newRowId,
              employee_id: employee.employee_id,
            })),
          ),
        })
      }

      // Crear nuevas relaciones de equipos para la nueva fila
      if (currentEquipment.length > 0) {
        await fetch("/api/daily-report/dailyreportequipmentrelations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            currentEquipment.map((equipment: any) => ({
              daily_report_row_id: newRowId,
              equipment_id: equipment.equipment_id,
            })),
          ),
        })
      }

      // Actualizar el estado del componente si es necesario
      setDailyReport((prevReport) =>
        prevReport.map((report) =>
          report.id === rowId
            ? {
                ...report,
                status: "reprogramado",
                description: `Reprogramado a ${data.date}`,
              }
            : report,
        ),
      )

      toast({
        title: "Éxito",
        description: "Fila reprogramada correctamente al nuevo parte diario.",
      })

      return true
    } catch (error) {
      console.error("Error al reprogramar la fila al nuevo parte diario:", error)
      toast({
        title: "Error",
        description: `Hubo un problema al reprogramar la fila al nuevo parte diario: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      return false
    }
  }

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
  }
}

