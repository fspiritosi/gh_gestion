import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
interface Sector {
  id: string;
  name: string;
  is_active: boolean;
}
function OrganigramTable({ sectors, onEdit }: { sectors: Sector[]; onEdit: (sector: Sector) => void }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-bold">Sectores</h2>

      <div className="overflow-x-auto max-h-96 overflow-y-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectors?.length > 0 ? (
              sectors.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell>
                    <Badge variant={sector.is_active ? 'success' : 'default'}>
                      {sector.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="link" className="hover:text-blue-400" onClick={() => onEdit(sector)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No hay sectores
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default OrganigramTable;
