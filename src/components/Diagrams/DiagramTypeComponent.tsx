'use client';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VerActivosButton } from '@/features/Empresa/RRHH/components/rrhh/verActivosButton';
import { useEffect, useState } from 'react';
import { DiagramNewTypeForm } from './DiagramNewTypeForm';

import BtnXlsDownload from '../BtnXlsDownload';

function DiagramTypeComponent({ diagrams_types }: { diagrams_types: DiagramType[] }) {
  const [selectDiagramType, setSelectDiagramType] = useState<{}>({});
  const [diagramToEdit, setDiagramToEdit] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  function setDiagram(data: any) {
    setSelectDiagramType(data);
  }

  function createDataToDownload(data: any) {
    const dataToDownload = data?.map((dato: any) => ({
      nombre: dato.name,
      color: dato.color,
      descCorta: dato.short_description,
      labActivo: dato.work_active ? 'Trabajando' : 'No trabajando',
    }));
    return dataToDownload;
  }

  useEffect(() => {
    if (Object.keys(selectDiagramType).length === 0) {
      setDiagramToEdit(false);
    } else {
      setDiagramToEdit(true);
    }
  }, [selectDiagramType]);

  return (
    <ResizablePanelGroup direction="horizontal" className="">
      <ResizablePanel>
        <DiagramNewTypeForm
          selectedDiagram={selectDiagramType}
          diagramToEdit={diagramToEdit}
          setDiagramToEdit={setDiagramToEdit}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="pl-6 min-w-[600px]" defaultSize={70}>
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Tipos de Novedades</h2>
          <VerActivosButton data={diagrams_types} filterKey="is_active" onFilteredChange={setFilteredData} />
        </div>
        <Table>
          <TableCaption>Lista de novedades de diagrama</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre de la Novedad</TableHead>
              <TableHead className="w-[100px]">Color</TableHead>
              <TableHead>Descripción Corta</TableHead>
              <TableHead>Vista Previa</TableHead>
              <TableHead>Lab. Activa</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData?.map((diagramType: any) => (
              <TableRow key={diagramType.name}>
                <TableCell>{diagramType.name}</TableCell>

                <TableCell>
                  <div className={`rounded-full w-5 h-5 border`} style={{ backgroundColor: diagramType.color }}></div>
                </TableCell>
                <TableCell>{diagramType.short_description}</TableCell>
                <TableCell>
                  <div
                    className="w-10 h-10 flex justify-center items-center"
                    style={{ backgroundColor: diagramType.color }}
                  >
                    {diagramType.short_description}
                  </div>
                </TableCell>
                <TableCell>{diagramType.work_active ? 'Si' : 'No'}</TableCell>
                <TableCell>
                  <Button
                    size={'sm'}
                    variant={'link'}
                    className="hover:text-blue-400"
                    onClick={() => setDiagram(diagramType)}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <BtnXlsDownload fn={createDataToDownload} dataToDownload={diagrams_types} nameFile={'Tipos_de_Diagrama'} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default DiagramTypeComponent;
