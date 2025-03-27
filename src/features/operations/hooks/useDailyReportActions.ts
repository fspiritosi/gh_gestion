'use client';

import type React from 'react';

import { toast } from '@/components/ui/use-toast';
import type { DailyReportItem } from '@/features/operations/types/types';
import { useState } from 'react';

export function useDailyReportActions(
  dailyReport: DailyReportItem[],
  setDailyReport: React.Dispatch<React.SetStateAction<DailyReportItem[]>>
) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<DailyReportItem | null>(null);

  // Reemplazar la función handleEdit con esta versión mejorada
  const handleEdit = (id: string) => {
    const itemToEdit = dailyReport.find((item) => item.id === id);
    if (itemToEdit) {
      // Asegurarse de que todos los campos están presentes y con el formato correcto
      const completeItemToEdit = {
        ...itemToEdit,
        customer: itemToEdit.customer ? String(itemToEdit.customer) : '',
        services: itemToEdit.services ? String(itemToEdit.services) : '',
        item: itemToEdit.item ? String(itemToEdit.item) : '',
        employees: itemToEdit.employees || [],
        equipment: itemToEdit.equipment || [],
        working_day: itemToEdit.working_day || '',
        status: itemToEdit.status || 'pendiente',
        description: itemToEdit.description || '',
        start_time: itemToEdit.start_time || '',
        end_time: itemToEdit.end_time || '',
      };

      console.log('Datos completos para edición:', completeItemToEdit);

      // Primero limpiar los estados anteriores
      setEditingData(null);
      setEditingId(null);
      setIsEditing(false);

      // Luego establecer los nuevos valores con un pequeño retraso
      setTimeout(() => {
        setEditingId(id);
        setEditingData(completeItemToEdit);
        setIsEditing(true);
      }, 50);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const deleteResponse = await fetch(`/api/daily-report/daily-report-row`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        throw new Error(`Error al eliminar la fila: ${errorText}`);
      }

      setDailyReport((prevReport) => prevReport.filter((item) => item.id !== id));

      toast({
        title: 'Éxito',
        description: 'Fila eliminada correctamente.',
      });
    } catch (error) {
      console.error('Error al eliminar la fila:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar la fila.',
        variant: 'destructive',
      });
    }
  };

  return {
    handleEdit,
    handleDelete,
    isEditing,
    editingId,
    editingData,
    setIsEditing,
    setEditingId,
  };
}
