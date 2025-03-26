"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import type { DailyReportItem } from "@/features/operations/types/types"

export function useDailyReportActions(
  dailyReport: DailyReportItem[],
  setDailyReport: React.Dispatch<React.SetStateAction<DailyReportItem[]>>,
) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<DailyReportItem | null>(null)

  const handleEdit = (id: string) => {
    const itemToEdit = dailyReport.find((item) => item.id === id)
    if (itemToEdit) {
      setEditingId(id)
      setEditingData(itemToEdit)
      setIsEditing(true)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const deleteResponse = await fetch(`/api/daily-report/daily-report-row`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text()
        throw new Error(`Error al eliminar la fila: ${errorText}`)
      }

      setDailyReport((prevReport) => prevReport.filter((item) => item.id !== id))

      toast({
        title: "Éxito",
        description: "Fila eliminada correctamente.",
      })
    } catch (error) {
      console.error("Error al eliminar la fila:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la fila.",
        variant: "destructive",
      })
    }
  }

  return {
    handleEdit,
    handleDelete,
    isEditing,
    editingId,
    editingData,
    setIsEditing,
    setEditingId,
  }
}

