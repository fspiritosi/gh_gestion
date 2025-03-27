"use client"

import { DatePicker } from "@/features/operations/components/DatePicker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReportFiltersProps {
  statusFilter: "abierto" | "cerrado" | "todos"
  setStatusFilter: (value: "abierto" | "cerrado" | "todos") => void
  startDate: Date | undefined
  setStartDate: (date: Date | undefined) => void
  endDate: Date | undefined
  setEndDate: (date: Date | undefined) => void
  itemsPerPage: number
  handleItemsPerPageChange: (value: number) => void
}

export default function ReportFilters({
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  itemsPerPage,
  handleItemsPerPageChange,
}: ReportFiltersProps) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="mr-4">Filtrar por estado:</span>
        <Select value={statusFilter} onValueChange={(value: "abierto" | "cerrado" | "todos") => setStatusFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue>{statusFilter}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="abierto">Abierto</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <span className="mr-4">Filtrar por fecha:</span>
        <DatePicker date={startDate} setDate={setStartDate} label="Fecha de Inicio" />
        <DatePicker date={endDate} setDate={setEndDate} label="Fecha de Fin" />

        <span>Filas por página: </span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => handleItemsPerPageChange(Number.parseInt(value))}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="Seleccionar cantidad" />
          </SelectTrigger>
          <SelectContent className="w-auto min-w-[70px] absolute">
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="30">30</SelectItem>
            <SelectItem value="40">40</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="60">60</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

