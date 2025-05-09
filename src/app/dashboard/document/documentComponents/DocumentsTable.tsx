import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { EditModal } from './EditDocumenTypeModal';

interface DocumentsTableProps {
  data: any[];
  filters: {
    name: string;
    multiresource: string;
    special: string;
    monthly: string;
    expired: string;
    mandatory: string;
    private: string;
  };
  children: React.ReactNode;
  employeeMockValues: Record<string, string[] | []>;
  vehicleMockValues: Record<string, string[] | []>;
  employees: EmployeeDetailed[];
  vehicles: VehicleWithBrand[];
}

const DocumentsTable = ({
  data,
  filters,
  children,
  employeeMockValues,
  vehicleMockValues,
  employees,
  vehicles,
}: DocumentsTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>{children}</TableRow>
    </TableHeader>
    <TableBody>
      {data?.map((doc) => (
        <TableRow key={doc.id}>
          <TableCell>{doc.name}</TableCell>
          <TableCell className="text-center">{doc.multiresource ? 'Si' : 'No'}</TableCell>
          <TableCell className="text-center">{doc.special ? 'Si' : 'No'}</TableCell>
          <TableCell className="text-center">{doc.is_it_montlhy ? 'Si' : 'No'}</TableCell>
          <TableCell className="text-center">{doc.explired ? 'Si' : 'No'}</TableCell>
          <TableCell className="text-center">{doc.mandatory ? 'Si' : 'No'}</TableCell>
          <TableCell className="text-center">{doc.private ? 'Si' : 'No'}</TableCell>
          <TableCell className="text-center">
            <EditModal
              Equipo={doc}
              employeeMockValues={employeeMockValues}
              vehicleMockValues={vehicleMockValues}
              employees={employees}
              vehicles={vehicles}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default DocumentsTable;
