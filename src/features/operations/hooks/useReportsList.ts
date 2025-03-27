"use client"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import moment from "moment"
import type { DailyReportData } from "@/features/operations/types/types"
import { fetchReports, transformDailyReports } from "@/features/operations/utils/utils"

export function useReportsList() {
  const [dailyReports, setDailyReports] = useState<DailyReportData[]>([])
  const [transformedReports, setTransformedReports] = useState<DailyReportData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState<"abierto" | "cerrado" | "todos">("todos")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{ id: string; status: boolean } | null>(null)

  // Cargar los reportes
  const loadReports = () => {
    fetchReports(setDailyReports, setIsLoading)
  }

  // Transformar los reportes cuando cambian
  useEffect(() => {
    const transformed = transformDailyReports(dailyReports)
    setTransformedReports(transformed)
  }, [dailyReports])

  // Filtrar reportes por fecha y estado
  const filteredReports = dailyReports.filter((report: any) => {
    const reportDate = moment(report.date).startOf("day")
    const matchesDateRange =
      (!startDate || reportDate.isSameOrAfter(moment(startDate).startOf("day"))) &&
      (!endDate || reportDate.isSameOrBefore(moment(endDate).startOf("day")))
    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "abierto" && report.status) ||
      (statusFilter === "cerrado" && !report.status)
    return matchesDateRange && matchesStatus
  })

  // Ordenar reportes por fecha
  const sortedReports = filteredReports.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
  })

  // Calcular paginación
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const currentReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Cambiar items por página
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset to first page when items per page changes
  }

  // Cambiar orden de clasificación
  const handleSortChange = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"))
  }

  // Manejar cambio de estado con advertencia
  const handleStatusChangeWithWarning = (id: string, status: boolean) => {
    const report = dailyReports.find((r) => r.id === id)
    if (!report) return

    if (!status) {
      // Si el nuevo estado es 'cerrado' (false)
      // Verificar si alguna fila tiene el estado "pendiente"
      const hasPendingRows = report.dailyreportrows?.some((row) => row.status === "pendiente")
      if (hasPendingRows) {
        toast({
          title: "Error",
          description: 'No se puede cerrar el parte diario porque algunas filas están en estado "pendiente".',
          variant: "destructive",
        })
        return
      }
      // Mostrar mensaje de advertencia antes de cerrar
      setPendingStatusChange({ id, status })
      setWarningDialogOpen(true)
    } else {
      handleStatusChange(id, status)
    }
  }

  // Confirmar cambio de estado
  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      handleStatusChange(pendingStatusChange.id, pendingStatusChange.status)
      setPendingStatusChange(null)
    }
    setWarningDialogOpen(false)
  }

  // Cambiar estado del reporte
  const handleStatusChange = async (reportId: string, newStatus: boolean) => {
    try {
      const URL = process.env.NEXT_PUBLIC_BASE_URL
      const response = await fetch(`${URL}/api/daily-report/?id=${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setDailyReports((prevReports) =>
        prevReports.map((report) => (report.id === reportId ? { ...report, status: newStatus } : report)),
      )

      toast({
        title: "Éxito",
        description: "El estado del reporte se ha actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error updating report status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del reporte.",
        variant: "destructive",
      })
    }
  }

  return {
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
    pendingStatusChange,
    filteredReports,
    sortedReports,
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
  }
}

