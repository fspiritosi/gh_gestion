'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DailyReportData } from '@/features/operations/types/types';
import moment from 'moment';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

interface ReportsTableProps {
  currentReports: DailyReportData[];
  sortOrder: 'asc' | 'desc';
  handleSortChange: () => void;
  handleStatusChangeWithWarning: (id: string, status: boolean) => void;
  handleViewReport: (report: DailyReportData) => void;
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

export default function ReportsTable({
  currentReports,
  sortOrder,
  handleSortChange,
  handleStatusChangeWithWarning,
  handleViewReport,
  isLoading,
  totalPages,
  currentPage,
  handlePageChange,
}: ReportsTableProps) {
  return (
    <>
      <Table>
        <TableCaption>{/* Aquí puedes agregar un título o descripción para la tabla */}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button onClick={handleSortChange} className="flex items-center">
                Fecha
                {sortOrder === 'asc' ? <FaAngleUp className="ml-1" /> : <FaAngleDown className="ml-1" />}
              </button>
            </TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentReports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{moment(report.date).format('DD/MM/YYYY')}</TableCell>
              <TableCell>
                <Select
                  value={report.status ? 'true' : 'false'}
                  onValueChange={(value: 'true' | 'false') =>
                    handleStatusChangeWithWarning(report.id, value === 'true')
                  }
                  disabled={report.status === false}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue>{report.status ? 'abierto' : 'cerrado'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">abierto</SelectItem>
                    <SelectItem value="false">cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => handleViewReport(report)} disabled={isLoading}>
                  Ver Completo
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <Button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            variant={currentPage === index + 1 ? 'default' : 'outline'}
            className="mx-1"
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </>
  );
}
