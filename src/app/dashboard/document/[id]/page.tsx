import { getDocumentEmployeesById, getDocumentEquipmentById } from '@/app/server/GET/actions';
import BackButton from '@/components/BackButton';
import DeleteDocument from '@/components/DeleteDocument';
import ReplaceDocument from '@/components/ReplaceDocument';
import UpdateDocuments from '@/components/UpdateDocuments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabaseServer } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import { getRole } from '@/lib/utils/getRole';
import { formatDate } from 'date-fns';
import { es } from 'date-fns/locale';
import moment from 'moment';
import { Suspense } from 'react';
import DownloadButton from '../documentComponents/DownloadButton';
export default async function page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { resource: string };
}) {
  let documents_employees: any[] | null = [];
  let resource = '';
  let documentName = '';
  let documentUrl = '';
  let document: any[] | null = [];
  let documentType: string | null = null;
  let resourceType: string | null = null;
  const supabase = supabaseServer();

  const role = await getRole();

  if (searchParams.resource === 'Persona') {
    const documents_employee = await getDocumentEmployeesById(params.id);
    document = documents_employee;
    resourceType = 'documentos-empleados';
    resource = 'employee';
  }

  if (searchParams.resource === 'Equipos') {
    const documents_equipment = await getDocumentEquipmentById(params.id);
    document = documents_equipment;
    resourceType = 'documentos-equipos';
    resource = 'vehicle';
  }

  documentType = document?.[0]?.document_types?.id;

  //const resorceId = document?.[0]?.applies?.id;
  // const { data } = await supabase.storage.from('document-files').list(resourceType, {
  //   search: `document-${documentType ?? ''}-${resorceId ?? ''}`,
  // });

  const { data: url } = supabase.storage.from('document-files').getPublicUrl(document?.[0]?.document_path);

  documentName = document?.[0]?.document_path;
  documentUrl = url.publicUrl;
  documents_employees = document;

  return (
    <section className="md:mx-7">
      <Card className="p-4">
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-col-3 ">
          <div className="lg:max-w-[30vw] col-span-1">
            <div className="flex  flex-col ">
              <div>
                <CardHeader>
                  <CardTitle className=" text-2xl">{documents_employees?.[0]?.document_types?.name}</CardTitle>

                  {documents_employees?.[0]?.state && (
                    <div className="flex flex-col">
                      <Badge
                        variant={
                          documents_employees?.[0]?.state === 'rechazado'
                            ? 'destructive'
                            : documents_employees?.[0]?.state === 'aprobado'
                              ? 'success'
                              : documents_employees?.[0]?.state === 'vencido'
                                ? 'yellow'
                                : 'default'
                        }
                        className={'mb-3 capitalize w-fit'}
                      >
                        {documents_employees?.[0]?.state}
                      </Badge>
                      {documents_employees?.[0]?.deny_reason && (
                        <Badge
                          variant={
                            documents_employees?.[0]?.state === 'rechazado' ||
                            documents_employees?.[0]?.state === 'vencido'
                              ? 'destructive'
                              : documents_employees?.[0]?.state === 'aprobado'
                                ? 'success'
                                : 'default'
                          }
                          className="mb-3 capitalize w-fit"
                        >
                          {documents_employees?.[0]?.deny_reason}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
              </div>
              <div className="flex justify-between mb-5 px-2">
                <DownloadButton
                  fileName={documents_employees?.[0]?.document_types?.name}
                  path={documents_employees?.[0]?.document_path}
                />
                <BackButton />
              </div>
            </div>
            <Tabs defaultValue="Documento" className="w-full px-2">
              <TabsList className="w-full justify-evenly">
                <TabsTrigger className={cn('hover:bg-white/30', resource === 'company' && 'hidden')} value="Empresa">
                  Empresa
                </TabsTrigger>
                <TabsTrigger className={cn('hover:bg-white/30', resource === 'company' && 'hidden')} value="Empleado">
                  {resource === 'employee' ? 'Empleado' : 'Equipo'}
                </TabsTrigger>
                <TabsTrigger className="hover:bg-white/30" value="Documento">
                  Documento
                </TabsTrigger>
                {role === 'Invitado' ? null : (
                  <TabsTrigger className="hover:bg-white/30" value="Auditar">
                    Actualizar
                  </TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="Empresa">
                <Card>
                  <div className="space-y-3 p-3">
                    <CardDescription>Datos de la empresa que solicita el documento</CardDescription>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell className="flex  items-center gap-3">
                            {' '}
                            <Avatar className="size-24">
                              <AvatarImage
                                src={documents_employees?.[0]?.applies?.company_id?.company_logo}
                                alt="Logo de la empresa"
                                className="rounded-full object-contain"
                              />
                              <AvatarFallback>Logo</AvatarFallback>
                            </Avatar>
                            <CardTitle className="font-bold text-lg">
                              {documents_employees?.[0]?.applies?.company_id?.company_name}
                            </CardTitle>
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <CardDescription>
                              <span className="font-bold">CUIT:</span>{' '}
                              {documents_employees?.[0]?.applies?.company_id?.company_cuit?.replace(
                                /(\d{2})(\d{8})(\d{1})/,
                                '$1-$2-$3'
                              )}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <CardDescription className="capitalize">
                              <span className="font-bold capitalize">Dirección:</span>{' '}
                              {documents_employees?.[0]?.applies?.company_id?.address}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <CardDescription className="capitalize">
                              <span className="font-bold">País:</span>{' '}
                              {documents_employees?.[0]?.applies?.company_id?.country}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <CardDescription className="capitalize">
                              <span className="font-bold">Provincia:</span>{' '}
                              {documents_employees?.[0]?.applies?.company_id?.province_id?.name}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <CardDescription>
                              <span className="font-bold">Teléfono de contacto:</span>{' '}
                              {documents_employees?.[0]?.applies?.company_id?.contact_phone}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <CardDescription>
                              <span className="font-bold">Email de contacto:</span>{' '}
                              {documents_employees?.[0]?.applies?.company_id?.contact_email}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <CardDescription>
                              <span className="font-bold">Fecha de alta:</span>{' '}
                              {(documents_employees?.[0]?.applies?.date_of_admission &&
                                formatDate(documents_employees?.[0]?.applies?.date_of_admission, 'dd/MM/yyyy', {
                                  locale: es,
                                })) ||
                                (documents_employees?.[0]?.applies?.created_at &&
                                  formatDate(documents_employees?.[0]?.applies?.created_at, 'dd/MM/yyyy', {
                                    locale: es,
                                  }))}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        {documents_employees?.[0]?.applies?.company_id?.description && (
                          <TableRow>
                            <TableCell>
                              <CardDescription className="capitalize">
                                <span className="font-bold">Descripción:</span>{' '}
                                {documents_employees?.[0]?.applies?.company_id?.description}
                              </CardDescription>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="Empleado">
                <Card>
                  <div className="p-3">
                    <div className="space-y-3">
                      <CardDescription>
                        Datos del {resource === 'employee' ? 'empleado' : 'equipo'} al que se le solicita el documento
                      </CardDescription>
                      <div className="flex items-center gap-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableCell className="flex  items-center gap-3">
                                {' '}
                                <Avatar className="size-24">
                                  <AvatarImage
                                    src={documents_employees?.[0]?.applies?.picture}
                                    className="rounded-full object-cover"
                                    alt="Imagen del recurso"
                                  />
                                  <AvatarFallback>recurso</AvatarFallback>
                                </Avatar>
                                <CardTitle className="font-bold text-lg">
                                  {resource === 'employee'
                                    ? documents_employees?.[0]?.applies.lastname +
                                      ' ' +
                                      documents_employees?.[0]?.applies.firstname
                                    : documents_employees?.[0]?.applies.domain ||
                                      documents_employees?.[0]?.applies.intern_number}
                                </CardTitle>
                              </TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                <CardDescription>
                                  {resource === 'employee' ? (
                                    <>
                                      <span className="font-bold">DNI:</span>{' '}
                                      {documents_employees?.[0]?.applies?.document_number}
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-bold">Dominio:</span>{' '}
                                      {documents_employees?.[0]?.applies?.domain}
                                    </>
                                  )}
                                </CardDescription>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <CardDescription>
                                  {resource === 'employee' ? (
                                    <>
                                      <span className="font-bold">CUIL:</span>{' '}
                                      {documents_employees?.[0]?.applies?.cuil?.replace(
                                        /(\d{2})(\d{8})(\d{1})/,
                                        '$1-$2-$3'
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-bold">Numero interno:</span>{' '}
                                      {documents_employees?.[0]?.applies?.intern_number}
                                    </>
                                  )}
                                </CardDescription>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <CardDescription>
                                  {resource === 'employee' ? (
                                    <>
                                      <span className="font-bold">Dirección:</span>{' '}
                                      {documents_employees?.[0]?.applies?.street +
                                        ' ' +
                                        documents_employees?.[0]?.applies?.street_number +
                                        ', ' +
                                        documents_employees?.[0]?.applies?.city.name}
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-bold">Marca:</span>{' '}
                                      {documents_employees?.[0]?.applies?.brand?.name}
                                    </>
                                  )}
                                </CardDescription>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <CardDescription>
                                  {resource === 'employee' ? (
                                    <>
                                      <span className="font-bold">Provincia:</span>{' '}
                                      {documents_employees?.[0]?.applies?.province?.name}
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-bold">Modelo:</span>{' '}
                                      {documents_employees?.[0]?.applies?.model?.name}
                                    </>
                                  )}
                                </CardDescription>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <CardDescription>
                                  {resource === 'employee' ? (
                                    <>
                                      <span className="font-bold">Teléfono de contacto:</span>{' '}
                                      {documents_employees?.[0]?.applies?.phone}
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-bold">Fecha de alta:</span>{' '}
                                      {documents_employees?.[0]?.applies?.created_at &&
                                        formatDate(documents_employees?.[0]?.applies?.created_at, 'dd/MM/yyyy', {
                                          locale: es,
                                        })}
                                    </>
                                  )}
                                </CardDescription>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <CardDescription>
                                  {resource === 'employee' ? (
                                    <>
                                      <span className="font-bold">Email de contacto:</span>{' '}
                                      {documents_employees?.[0]?.applies?.email}
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-bold">Motor:</span>{' '}
                                      {documents_employees?.[0]?.applies?.engine}
                                    </>
                                  )}
                                </CardDescription>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <CardDescription>
                                  {resource === 'employee' ? (
                                    <>
                                      <span className="font-bold">Fecha de alta:</span>{' '}
                                      {documents_employees?.[0]?.applies?.created_at &&
                                        formatDate(documents_employees?.[0]?.applies?.created_at, 'dd/MM/yyyy', {
                                          locale: es,
                                        })}
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-bold">Chasis:</span>{' '}
                                      {documents_employees?.[0]?.applies?.chassis}
                                    </>
                                  )}
                                </CardDescription>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <div>
                                  {resource === 'employee' ? (
                                    <>
                                      <CardDescription>
                                        <span className="font-bold">Afectaciones:</span>{' '}
                                      </CardDescription>
                                      <ul>
                                        <CardDescription>
                                          {documents_employees?.[0]?.applies?.contractor_employee?.map(
                                            (contractor: any) => {
                                              return (
                                                <li key={contractor?.contractors?.name}>
                                                  {contractor?.contractors?.name}
                                                </li>
                                              );
                                            }
                                          )}
                                        </CardDescription>
                                      </ul>
                                    </>
                                  ) : (
                                    <>
                                      <CardDescription>
                                        <span className="font-bold">Tipo de vehiculo:</span>{' '}
                                        {documents_employees?.[0]?.applies?.type_of_vehicle?.name}
                                      </CardDescription>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="Documento" className="space-y-3">
                <Card>
                  <div className="p-3">
                    <CardTitle className="pb-3">Datos del documento que se le solicita al empleado</CardTitle>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell>
                            {' '}
                            <CardTitle className="pb-3">{documents_employees?.[0]?.document_types?.name}</CardTitle>
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <CardDescription>
                              {documents_employees?.[0]?.document_types?.mandatory
                                ? 'Es mandatorio'
                                : 'No es mandatorio'}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <CardDescription>
                              {documents_employees?.[0]?.document_types?.multiresource
                                ? 'Es multirecurso'
                                : 'No es multirecurso'}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <CardDescription>
                              {documents_employees?.[0]?.document_types?.explired
                                ? 'Vence el ' + moment(documents_employees?.[0]?.validity).format('DD/MM/YYYY')
                                : 'No tiene vencimiento'}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <CardDescription>
                              Documento aplica a {documents_employees?.[0]?.document_types?.applies}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <CardDescription>
                              Subido el{' '}
                              {documents_employees?.[0]?.created_at &&
                                formatDate(documents_employees?.[0]?.created_at, 'dd/MM/yyyy', {
                                  locale: es,
                                })}{' '}
                              a las{' '}
                              {documents_employees?.[0]?.created_at &&
                                formatDate(documents_employees?.[0]?.created_at, 'p', {
                                  locale: es,
                                })}
                            </CardDescription>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            {documents_employees?.[0]?.document_types?.special && (
                              <CardDescription>
                                Este documento tiene consideraciones especiales a tener en cuenta (
                                {documents_employees?.[0]?.document_types?.description})
                              </CardDescription>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="Auditar">
                <Card>
                  <div className="p-3 text-center space-y-3">
                    <CardDescription>
                      Si el documento es rechazado, vencido o necesita ser actualizado puedes hacerlo desde aquí, una
                      vez aprobado el documento no podrá ser modificado
                    </CardDescription>
                    <div className="w-full flex justify-evenly flex-wrap">
                      <UpdateDocuments
                        id={params.id}
                        resource={resource}
                        documentName={documentName}
                        expires={documents_employees?.[0]?.document_types?.explired}
                        montly={documents_employees?.[0]?.document_types?.is_it_montlhy}
                      />
                      <ReplaceDocument
                        id={params.id}
                        resource={resource}
                        documentName={documentName}
                        expires={documents_employees?.[0]?.validity}
                        montly={documents_employees?.[0]?.period}
                        appliesId={document?.[0]?.id}
                      />
                      <DeleteDocument
                        id={params.id}
                        resource={resource}
                        documentName={documentName}
                        expires={documents_employees?.[0]?.document_types?.explired}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <Suspense fallback={<Skeleton className="w-full h-full mt-5" />}>
            <div className="max-w-[70vw] col-span-2 px-7 pb-7">
              <Card className="mt-4">
                <CardDescription className="p-3 flex justify-center">
                  <embed
                    src={`${documentUrl}#&navpanes=0&scrollbar=0&zoom=110`}
                    className={cn(
                      'max-w-full max-h-screen rounded-xl aspect-auto',
                      documentUrl.split('.').pop()?.toLocaleLowerCase() === 'pdf' ? 'w-full min-h-screen' : ''
                    )}
                  />
                </CardDescription>
              </Card>
            </div>
          </Suspense>
        </div>
      </Card>
    </section>
  );
}
