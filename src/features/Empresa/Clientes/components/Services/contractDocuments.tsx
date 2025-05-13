'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { createClient } from '@supabase/supabase-js';
import { Download, Eye, FileSpreadsheet, FileText, ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

// Importar los componentes de tabla de shadcn/ui
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Definir tipos
interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  url: string;
  path: string;
  contract_id: string;
  description: string;
}

interface DocumentManagementProps {
  id: string;
}

// Inicializar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function contractDocuments({ id }: DocumentManagementProps) {
  // const params = useParams();
  // const id = params?.id as string;
  const [contract, setContract] = useState<any>(null);
  // Referencias y estados
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<Document | null>(null);
  const [docType, setDocType] = useState<string>('Contrato');
  const [docDescription, setDocDescription] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [id]);

  const router = useRouter();

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data: documentMetadata, error: metadataError } = await supabase
        .from('documents_contracts' as any)
        .select('*')
        .eq('contract_id', id);

      if (metadataError) {
        throw metadataError;
      }

      const documentsWithUrls = await Promise.all(
        documentMetadata.map(async (doc) => {
          const { data: urlData } = await supabase.storage
            .from('contract-documents')
            .createSignedUrl(doc.path, 60 * 60); // URL válida por 1 hora

          return {
            ...doc,
            url: urlData?.signedUrl || '',
          };
        })
      );

      setDocuments(documentsWithUrls as any);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los documentos. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const supabase = supabaseBrowser();

  useEffect(() => {
    if (!id) return;

    const fetchContract = async () => {
      const { data, error } = await supabase
        .from('customer_services')
        .select('*, customer_id(name), area_id(nombre), sector_id(name), company_id(company_name)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contract:', error);
      } else {
        setContract(data);
      }
    };

    fetchContract();
  }, [id, supabase]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    toast({
      title: 'Archivos seleccionados',
      description: `Se han seleccionado ${newFiles.length} archivo(s). Presiona "Subir documento" para completar la carga.`,
    });
  };

  const createSafeFolderName = (name: string) => {
    if (!name) return 'default';
    return name
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/-+/g, '_');
  };

  const uploadSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'No hay archivos',
        description: 'Selecciona al menos un archivo para subir.',
      });
      return;
    }

    if (!contract || !contract.customer_id) {
      toast({
        title: 'Error',
        description: 'No se pudo obtener la información del cliente o contrato.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);

      const companyName = contract.company_id.company_name || 'company_desconocida';
      const customerName = contract.customer_id.name || 'cliente_desconocido';
      const contractTitle = contract.service_name || 'contrato_sin_titulo';
      const companyFolderName = createSafeFolderName(companyName);
      const customerFolderName = createSafeFolderName(customerName);
      const contractFolderName = createSafeFolderName(contractTitle);

      for (const file of selectedFiles) {
        let type = 'otro';
        if (file.type.includes('pdf')) type = 'pdf';
        else if (file.type.includes('image')) type = 'image';
        else if (
          file.type.includes('excel') ||
          file.type.includes('spreadsheet') ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')
        )
          type = 'excel';

        const sizeInKB = file.size / 1024;
        let size = '';
        if (sizeInKB < 1024) {
          size = `${sizeInKB.toFixed(1)} KB`;
        } else {
          size = `${(sizeInKB / 1024).toFixed(1)} MB`;
        }

        const timestamp = Date.now();
        const filePath = `${companyFolderName}/${customerFolderName}/${contractFolderName}/${timestamp}-${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('contract-documents')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: documentData, error: documentError } = await supabase
          .from('documents_contracts' as any)
          .insert([
            {
              name: file.name,
              type,
              date: new Date().toISOString(),
              size,
              path: filePath,
              contract_id: contract?.id,
              description: docDescription,
            },
          ])
          .select();

        if (documentError) {
          throw documentError;
        }
      }

      await fetchDocuments();
      setSelectedFiles([]);
      setDocType('Contrato');
      setDocDescription('');

      toast({
        title: 'Archivos subidos',
        description: `Se han subido ${selectedFiles.length} archivo(s) correctamente.`,
      });
    } catch (error) {
      console.error('Error al subir documentos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron subir los documentos. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleDeleteDocument = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (documentToDelete) {
      try {
        const { error: storageError } = await supabase.storage
          .from('contract-documents')
          .remove([documentToDelete.path]);

        if (storageError) {
          throw storageError;
        }

        const { error: dbError } = await supabase
          .from('documents_contracts' as any)
          .delete()
          .eq('id', documentToDelete.id);

        if (dbError) {
          throw dbError;
        }

        setDocuments((prev) => prev.filter((doc) => doc.id !== documentToDelete.id));

        if (selectedFile && selectedFile.id === documentToDelete.id) {
          setSelectedFile(null);
        }

        toast({
          title: 'Documento eliminado',
          description: `Se ha eliminado "${documentToDelete.name}" correctamente.`,
        });
      } catch (error) {
        console.error('Error al eliminar documento:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el documento. Intenta de nuevo.',
          variant: 'destructive',
        });
      }
    }
    setDeleteConfirmOpen(false);
    setDocumentToDelete(null);
  };

  const handleDownload = async (doc: Document) => {
    try {
      if (doc.url) {
        window.open(doc.url, '_blank');
        return;
      }

      const { data, error } = await supabase.storage.from('contract-documents').createSignedUrl(doc.path, 60 * 60);

      if (error) {
        throw error;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');

        toast({
          title: 'Descarga iniciada',
          description: `Descargando "${doc.name}"`,
        });
      }
    } catch (error) {
      console.error('Error al descargar documento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el documento. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="max-w-7xl">
      <div className="flex justify-end md:mb-4 mb-2">
        {/* <Link href="/dashboard/company/actualCompany?tab=comerce&subtab=service">
          <Button>Volver</Button>
        </Link> */}
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Subir Documento</h3>
              {/* {contract && contract.customer_id && (
                <div className="mb-4 text-sm border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded">
                  <p>
                    <span className="font-medium">Cliente:</span> {contract.customer_id.name}
                  </p>
                  <p>
                    <span className="font-medium">Contrato:</span> {contract.service_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Los archivos se guardarán en la carpeta: {createSafeFolderName(contract.customer_id.name)}/
                    {createSafeFolderName(contract.service_name)}
                  </p>
                </div>
              )} */}
              <div className="space-y-4">
                <div
                  className={`border-2 ${isDragging ? 'border-green-500 bg-green-50' : 'border-dashed'} rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={openFileSelector}
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 mx-auto mb-2 text-slate-400 animate-spin" />
                  ) : (
                    <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-green-500' : 'text-slate-400'}`} />
                  )}
                  <p className="text-sm text-slate-500">
                    {isUploading
                      ? 'Subiendo archivos...'
                      : isDragging
                        ? 'Suelta los archivos aquí'
                        : 'Arrastra y suelta archivos aquí o'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled={isUploading}
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileSelector();
                    }}
                  >
                    Seleccionar archivos
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    multiple
                    disabled={isUploading}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 border rounded p-3 bg-slate-50">
                    <h4 className="text-sm font-medium mb-2">Archivos seleccionados ({selectedFiles.length})</h4>
                    <div className="max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm py-1">
                          <div className="flex items-center">
                            {file.type.includes('pdf') && <FileText className="h-4 w-4 mr-2 text-red-500" />}
                            {file.type.includes('image') && <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />}
                            {(file.type.includes('excel') ||
                              file.type.includes('spreadsheet') ||
                              file.name.endsWith('.xlsx') ||
                              file.name.endsWith('.xls')) && (
                              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />
                            )}
                            <span className="truncate max-w-[180px]">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => {
                              setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="docType">Tipo de documento</Label>
                  {/* <select
                    className="w-full p-2 border rounded-md"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    disabled={isUploading}
                  >
                    <option>Contrato</option>
                    <option>Anexo</option>
                    <option>Factura</option>
                    <option>Otro</option>
                  </select> */}
                  <Input
                    id="docType"
                    type="text"
                    placeholder="Tipo de documento"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    disabled={isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docDescription">Descripción</Label>
                  <Input
                    id="docDescription"
                    type="text"
                    placeholder="Descripción breve del documento"
                    value={docDescription}
                    onChange={(e) => setDocDescription(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={uploadSelectedFiles}
                  disabled={isUploading || selectedFiles.length === 0}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    'Subir documento'
                  )}
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Documentos del Contrato</h3>
                <Input
                  placeholder="Buscar documentos..."
                  className="max-w-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div
                className={
                  !selectedFile
                    ? 'border rounded-lg overflow-x-auto overflow-y-hidden'
                    : 'border rounded-lg overflow-x-auto max-h-[250px] overflow-y-auto'
                }
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <Loader2 className="h-8 w-8 text-slate-400 animate-spin mb-2" />
                    <p className="text-slate-500">Cargando documentos...</p>
                  </div>
                ) : filteredDocuments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tamaño</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {doc.type === 'pdf' && <FileText className="h-4 w-4 mr-2 text-red-500" />}
                              {doc.type === 'image' && <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />}
                              {doc.type === 'excel' && <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />}
                              <span className="text-sm">{doc.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{doc.type.toUpperCase()}</TableCell>
                          <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                          <TableCell>{doc.size}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFile(doc)}
                                className="h-8 w-8 p-0"
                                title="Ver"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDownload(doc)}
                                title="Descargar"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteDocument(doc)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <FileText className="h-12 w-12 text-slate-300 mb-2" />
                    {searchTerm ? (
                      <>
                        <p className="text-slate-500 mb-1">
                          No se encontraron documentos que coincidan con {searchTerm}
                        </p>
                        <p className="text-sm text-slate-400">Intenta con otro término de búsqueda</p>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-500 mb-1">No hay documentos para este contrato</p>
                        <p className="text-sm text-slate-400">
                          Sube documentos arrastrándolos o usando el botón de selección
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="mt-6 border rounded-lg p-4">
                  <h4 className="font-medium">Descripción: {selectedFile.description}</h4>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Vista previa: {selectedFile.name}</h4>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                      Cerrar
                    </Button>
                  </div>
                  {/* <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center overflow-hidden"> */}
                  <div className="bg-slate-100 rounded-lg h-[700px] flex items-center justify-center overflow-hidden">
                    {selectedFile.type === 'pdf' ? (
                      <embed src={selectedFile.url} type="application/pdf" width="100%" height="600px" />
                    ) : selectedFile.type === 'image' ? (
                      <img
                        src={selectedFile.url || '/placeholder.svg'}
                        alt="Vista previa"
                        className="max-h-full max-w-full w-full object-contain mx-auto"
                      />
                    ) : selectedFile.type === 'excel' ? (
                      <div className="w-full h-40 overflow-auto">
                        <div className="text-center mb-2">
                          <FileSpreadsheet className="h-8 w-8 mx-auto text-green-500" />
                          <p className="text-sm font-medium">Vista previa de Excel</p>
                        </div>
                        <div className="w-full overflow-x-auto">
                          {/* <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-green-50">
                                <th className="border border-green-200 px-3 py-2 text-xs"></th>
                                <th className="border border-green-200 px-3 py-2 text-xs">A</th>
                                <th className="border border-green-200 px-3 py-2 text-xs">B</th>
                                <th className="border border-green-200 px-3 py-2 text-xs">C</th>
                                <th className="border border-green-200 px-3 py-2 text-xs">D</th>
                                <th className="border border-green-200 px-3 py-2 text-xs">E</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row}>
                                  <td className="border border-green-100 bg-green-50 px-3 py-2 text-xs font-medium">
                                    {row}
                                  </td>
                                  {["A", "B", "C", "D", "E"].map((col) => (
                                    <td key={col} className="border border-green-100 px-3 py-2 text-xs">
                                      {selectedFile.name.includes("Presupuesto") && row === 2 && col === "B"
                                        ? "€ 25,000.00"
                                        : selectedFile.name.includes("Presupuesto") && row === 3 && col === "B"
                                          ? "€ 15,000.00"
                                          : selectedFile.name.includes("Presupuesto") && row === 4 && col === "B"
                                            ? "€ 10,000.00"
                                            : selectedFile.name.includes("Presupuesto") && row === 2 && col === "A"
                                              ? "Fase 1"
                                              : selectedFile.name.includes("Presupuesto") && row === 3 && col === "A"
                                                ? "Fase 2"
                                                : selectedFile.name.includes("Presupuesto") && row === 4 && col === "A"
                                                  ? "Fase 3"
                                                  : ""}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table> */}
                        </div>
                        <div className="flex justify-center mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleDownload(selectedFile)}
                          >
                            <Download className="h-3 w-3 mr-1" /> Descargar Excel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs ml-2"
                            onClick={() => window.open(selectedFile.url, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" /> Abrir en visor completo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto text-slate-400" />
                        <p className="mt-2">Vista previa no disponible</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleDownload(selectedFile)}
                        >
                          Descargar archivo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el documento {documentToDelete?.name}? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
