'use client';

import AddTypeModal from '@/components/AddTypeModal';
import BackButton from '@/components/BackButton';
import { CheckboxDefaultValues } from '@/components/CheckboxDefValues';
import { ImageHander } from '@/components/ImageHandler';
import { Modal } from '@/components/Modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { onCreate, onUpdate } from '@/features/equipments/action/actions';
import { getVehicleSchema } from '@/features/equipments/schemas/schemas';
import { dataType, generic } from '@/features/equipments/type/type';
import { downloadQR, handleImageChange, printQR } from '@/features/equipments/utils/utils';
import { useImageUpload } from '@/hooks/useUploadImage';
import { cn } from '@/lib/utils';
import { useCountriesStore } from '@/store/countries';
import { useLoggedUserStore } from '@/store/loggedUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { CaretSortIcon, CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import { AlertTriangle, CheckCircle, Copy, Download, Info, Printer, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { ChangeEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiToolsFill } from 'react-icons/ri';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '../../../../../../supabase/supabase';

require('dotenv').config();

export default function VehiclesForm2({
  vehicle,
  children,
  types: vehicleType,
  brand_vehicles,
  role,
}: {
  vehicle: any | null;
  children: ReactNode;
  types: generic[];
  brand_vehicles: VehicleBrand[] | null;
  role?: string;
}) {
  const searchParams = useSearchParams();
  // const id = params
  const [accion, setAccion] = useState(searchParams.get('action'));

  const fetchLogged = useLoggedUserStore((state) => state.loggedUser);

  const fetchLoggedUser = useCallback(() => {
    fetchLogged();
  }, [fetchLogged]);

  // Ejecuta el efecto solo una vez, cuando el componente se monte
  useEffect(() => {
    fetchLoggedUser();
  }, [fetchLoggedUser]);

  const actualCompany = useLoggedUserStore((state) => state.actualCompany);

  // const role = useLoggedUserStore((state) => state.roleActualCompany);
  const [type, setType] = useState('');

  const [data, setData] = useState<dataType>({
    tipe_of_vehicles: [],
    models: [],
  });

  useEffect(() => {
    if (vehicle && vehicle.type_of_vehicle === 'Vehículos') {
      setHideInput(true);
    }
    if (vehicle && vehicle.type_of_vehicle === 'Otros') {
      setHideInput(false);
    }
    if (!vehicle) {
      setHideInput(false);
    }
  }, [vehicle]);

  const router = useRouter();
  const [hideInput, setHideInput] = useState(false);
  const [readOnly, setReadOnly] = useState(accion === 'view' ? true : false);

  const fetchData = async () => {
    let { data: types_of_vehicles } = await supabase.from('types_of_vehicles').select('*');

    setData({
      ...data,
      tipe_of_vehicles: types_of_vehicles as generic[],
    });
  };

  supabase
    .channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'brand_vehicles' }, () => {
      fetchData();
    })
    .subscribe();

  useEffect(() => {
    fetchData();
  }, []);
  const fetchContractors = useCountriesStore((state) => state.fetchContractors);
  const subscribeToCustomersChanges = useCountriesStore((state) => state.subscribeToCustomersChanges);
  useEffect(() => {
    fetchContractors();

    const unsubscribe = subscribeToCustomersChanges();

    return () => {
      unsubscribe();
    };
  }, [fetchContractors, subscribeToCustomersChanges]);

  const contractorCompanies = useCountriesStore((state) =>
    state.customers?.filter((company: any) => company.company_id.toString() === actualCompany?.id && company.is_active)
  );

  const types = data.tipe_of_vehicles?.map((e) => e.name);
  const vehicleModels = data.models;
  const vehicleSchema = getVehicleSchema(hideInput);
  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      year: vehicle?.year || undefined,
      engine: vehicle?.engine || '',
      chassis: vehicle?.chassis || '',
      serie: vehicle?.serie || '',
      domain: vehicle?.domain || '',
      intern_number: vehicle?.intern_number || '',
      picture: vehicle?.picture || '',
      allocated_to: vehicle?.allocated_to || [],

      brand: vehicle?.brand || '',
      model: vehicle?.model || '',
      type_of_vehicle: vehicle?.type_of_vehicle || '',
      type: vehicle?.type || '',
      kilometer: vehicle?.kilometer || '',
    },
  });

  const fetchModels = async (brand_id: string) => {
    let { data: model_vehicles } = await supabase.from('model_vehicles').select('*').eq('brand', brand_id);

    setData({
      ...data,
      models: model_vehicles as generic[],
    });
  };
  const url = process.env.NEXT_PUBLIC_PROJECT_URL;
  const URLQR = process.env.NEXT_PUBLIC_BASE_URL;
  const mandatoryDocuments = useCountriesStore((state) => state.mandatoryDocuments);
  const loggedUser = useLoggedUserStore((state) => state.credentialUser?.id);

  const { uploadImage } = useImageUpload();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string>('');

  // const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];

  //   if (file) {
  //     setImageFile(file);
  //     // Convertir la imagen a base64
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       if (e.target && typeof e.target.result === 'string') {
  //         setBase64Image(e.target.result);
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleImageChangeWrapper = (event: ChangeEvent<HTMLInputElement>) => {
    handleImageChange(event, setImageFile, setBase64Image);
  };

  const downloadQRWrapper = () => {
    downloadQR(qrCodeRef, vehicle?.domain || vehicle?.serie || 'QR');
  };

  const printQRWrapper = () => {
    printQR(qrCodeRef);
  };

  const variants: any = {
    operativo: 'success',
    'no operativo': 'destructive',
    'en reparación': 'yellow',
    'operativo condicionado': 'info',
    default: 'default',
  };

  const conditionConfig: any = {
    'operativo condicionado': { color: 'bg-blue-500', icon: AlertTriangle },
    operativo: { color: 'bg-green-500', icon: CheckCircle },
    'no operativo': { color: 'bg-red-500', icon: XCircle },
    'en reparación': { color: 'bg-yellow-500', icon: RiToolsFill },
  };

  const qrUrl = `${URLQR}maintenance?equipment=${vehicle?.id}`;
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // const downloadQR = async () => {
  //   if (!qrCodeRef.current) return;

  //   try {
  //     const dataUrl = await toPng(qrCodeRef.current);

  //     const link = document.createElement('a');
  //     link.href = dataUrl;
  //     link.download = `qr-code${vehicle.domain || vehicle.serie}.png`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (error) {
  //     console.error('Error generating image:', error);
  //   }
  // };

  // const printQR = () => {
  //   if (!qrCodeRef.current) return;

  //   const qrCodeElement = qrCodeRef.current;
  //   const iframe = document.createElement('iframe');
  //   iframe.style.position = 'absolute';
  //   iframe.style.width = '0';
  //   iframe.style.height = '0';
  //   iframe.style.border = 'none';
  //   document.body.appendChild(iframe);

  //   const iframeDoc = iframe.contentWindow?.document;
  //   if (iframeDoc) {
  //     iframeDoc.write('<html><head><title>Print QR Code</title></head><body>');
  //     iframeDoc.write(qrCodeElement.innerHTML);
  //     iframeDoc.write('</body></html>');
  //     iframeDoc.close();
  //     iframe.contentWindow?.focus();
  //     iframe.contentWindow?.print();
  //   }

  //   document.body.removeChild(iframe);
  // };
  const handleSubmitForm = (values: any) => {
    if (accion === 'edit' || accion === 'view') {
      return onUpdate(
        vehicle,
        values,
        uploadImage,
        imageFile,
        actualCompany,
        vehicleType,
        data,
        brand_vehicles,
        router
      );
    } else {
      return onCreate(values, uploadImage, imageFile, actualCompany, vehicleType, data, brand_vehicles, router);
    }
  };

  return (
    <section className="grid max-w-full ">
      <header className="flex justify-between gap-4 flex-wrap">
        <div className="mb-4 flex justify-between w-full">
          <CardHeader className="h-[152px] flex flex-row gap-4 justify-between items-center flex-wrap w-full bg-muted dark:bg-muted/50 border-b-2">
            {accion === 'edit' || accion === 'view' ? (
              <div className="flex gap-3 items-center">
                <CardTitle className=" font-bold tracking-tight">
                  <Avatar className="size-[100px]">
                    <AvatarImage
                      className="object-cover border-2 border-black/30 rounded-full"
                      src={
                        vehicle?.picture ||
                        'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80'
                      }
                      alt="Imagen del empleado"
                    />
                    <AvatarFallback>CC</AvatarFallback>
                  </Avatar>
                </CardTitle>
                <div className="text-muted-foreground text-2xl flex flex-col">
                  <div>Tipo de equipo: {vehicle?.type?.name}</div>

                  <div>Numero interno: {vehicle?.intern_number}</div>
                  <Badge
                    className="w-fit mt-2 capitalize"
                    variant={variants[(vehicle?.condition as any) || 'default'] as any}
                  >
                    <>
                      {React.createElement(
                        conditionConfig[vehicle?.condition || ('default' as keyof typeof conditionConfig)]?.icon || 's',
                        { className: 'mr-2 size-4' }
                      )}
                      {vehicle?.condition}
                    </>
                  </Badge>
                </div>
              </div>
            ) : (
              <div>
                <CardTitle className="font-bold tracking-tight text-3xl">
                  {accion === 'edit'
                    ? 'Editar equipo'
                    : accion === 'view'
                      ? `Equipo ${vehicle?.type_of_vehicle} ${vehicle?.intern_number}`
                      : 'Agregar equipo'}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xl">
                  {accion === 'edit' || accion === 'view'
                    ? `${readOnly ? 'Vista previa de equipo' : ' En esta vista puedes editar los datos del equipo'}`
                    : 'En esta vista puedes agregar un nuevo equipo'}
                </CardDescription>
              </div>
            )}

            <div className="mt-4 flex flex-row gap-2">
              {role !== 'Invitado' && readOnly && accion === 'view' && (
                <div className="flex flex-row gap-2">
                  <Button
                    variant="default"
                    onClick={() => {
                      setReadOnly(false);
                    }}
                  >
                    Habilitar edición
                  </Button>
                </div>
              )}
              <div className="flex flex-row gap-2">
                <BackButton />
              </div>
            </div>
          </CardHeader>
        </div>
      </header>
      <Tabs defaultValue="equipment" className="w-full ">
        <TabsList className="mx-3 py-2">
          <TabsTrigger value="equipment">Equipo</TabsTrigger>
          {accion !== 'new' && <TabsTrigger value="documents">Documentos</TabsTrigger>}
          {accion !== 'new' && <TabsTrigger value="repairs">Reparaciones</TabsTrigger>}
          {accion !== 'new' && <TabsTrigger value="QR">QR</TabsTrigger>}
        </TabsList>
        <TabsContent value="equipment" className="px-3 py-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitForm)} className="w-full">
              <div className=" flex gap-[2vw] flex-wrap items-center">
                <FormField
                  control={form.control}
                  name="type_of_vehicle"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-w-[250px]">
                      <FormLabel>
                        Tipo de equipo <span style={{ color: 'red' }}>*</span>{' '}
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={readOnly}
                              variant="outline"
                              role="combobox"
                              value={vehicle?.type_of_vehicle}
                              className={cn('w-[250px] justify-between', !field.value && 'text-muted-foreground')}
                            >
                              {field.value ? field.value : 'Seleccionar tipo de equipo'}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0">
                          <Command>
                            <CommandInput
                              disabled={readOnly}
                              placeholder="Buscar tipo de equipo..."
                              className="h-9"
                              //value={field.value}
                            />
                            <CommandEmpty>No se encontro ningun resultado</CommandEmpty>
                            <CommandGroup>
                              {types?.map((option) => (
                                <CommandItem
                                  value={option}
                                  key={option}
                                  onSelect={() => {
                                    form.setValue('type_of_vehicle', option);

                                    if (option === 'Vehículos') {
                                      setHideInput(true);
                                    }
                                    if (option === 'Otros') {
                                      setHideInput(false);
                                    }
                                  }}
                                >
                                  {option}
                                  <CheckIcon
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      option === field.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Selecciona el tipo de equipo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-w-[250px]">
                      <FormLabel>
                        Marca <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={readOnly}
                              variant="outline"
                              role="combobox"
                              value={field.value}
                              className={cn('w-[250px] justify-between', !field.value && 'text-muted-foreground')}
                            >
                              {field.value || 'Seleccionar marca'}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0 max-h-[200px] overflow-y-auto">
                          <Command>
                            <CommandInput disabled={readOnly} placeholder="Buscar marca..." className="h-9" />
                            <CommandEmpty className="py-2 px-2">
                              <Modal modal="addBrand" fetchData={fetchData}>
                                <Button
                                  disabled={readOnly}
                                  variant="outline"
                                  role="combobox"
                                  className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                >
                                  Agregar marca
                                  <PlusCircledIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </Modal>
                            </CommandEmpty>
                            <CommandGroup>
                              {brand_vehicles?.map((option) => (
                                <CommandItem
                                  value={option.name || ''}
                                  key={option.name}
                                  onSelect={() => {
                                    form.setValue('brand', option.name || '');
                                    fetchModels(`${option.id}`);
                                  }}
                                >
                                  {option.name}
                                  <CheckIcon
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      option.name === field.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Selecciona la marca del Equipo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-w-[250px]">
                      <FormLabel>
                        {' '}
                        Modelo <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={readOnly}
                              variant="outline"
                              role="combobox"
                              className={cn('w-[250px] justify-between', !field.value && 'text-muted-foreground')}
                            >
                              {field.value || 'Seleccionar marca'}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0">
                          <Command>
                            <CommandInput disabled={readOnly} placeholder="Buscar modelo..." className="h-9" />
                            <CommandEmpty className="py-2 px-2">
                              <Modal modal="addModel" fetchModels={fetchModels} brandOptions={brand_vehicles}>
                                <Button
                                  disabled={readOnly}
                                  variant="outline"
                                  role="combobox"
                                  className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                >
                                  Agregar modelo
                                  <PlusCircledIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </Modal>
                            </CommandEmpty>
                            <CommandGroup>
                              <>
                                {vehicleModels?.map((option) => (
                                  <CommandItem
                                    value={option.name}
                                    key={option.name}
                                    onSelect={() => {
                                      form.setValue('model', option.name);
                                    }}
                                  >
                                    {option.name}
                                    <CheckIcon
                                      className={cn(
                                        'ml-auto h-4 w-4',
                                        option.name === field.value ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </>
                              <>
                                <Modal modal="addModel" fetchModels={fetchModels} brandOptions={brand_vehicles}>
                                  <Button
                                    disabled={readOnly}
                                    variant="outline"
                                    role="combobox"
                                    className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                  >
                                    Agregar modelo
                                    <PlusCircledIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </Modal>
                              </>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Selecciona el modelo del equipo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-w-[250px]">
                      <FormLabel>
                        {' '}
                        Año <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        {...field}
                        disabled={readOnly}
                        className="input w-[250px]"
                        placeholder="Año"
                        value={field.value !== undefined ? field.value : vehicle?.year || ''}
                        onChange={(e) => {
                          form.setValue('year', e.target.value);
                        }}
                      />
                      <FormDescription>Ingrese el año del equipo</FormDescription>
                      <FormMessage className="max-w-[250px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kilometer"
                  render={({ field }) => (
                    <FormItem className={cn('flex flex-col min-w-[250px]', !hideInput && 'hidden')}>
                      <FormLabel>Kilometraje</FormLabel>
                      <Input
                        {...field}
                        disabled={readOnly}
                        className="input w-[250px]"
                        placeholder="Kilometraje"
                        defaultValue={0}
                        value={field.value !== undefined ? field.value : vehicle?.kilometer || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (isNaN(Number(value)) || value === ' ') {
                            return;
                          }
                          form.setValue('kilometer', value);
                        }}
                      />
                      <FormDescription>Ingrese el kilometraje del equipo</FormDescription>
                      <FormMessage className="max-w-[250px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="engine"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-w-[250px]">
                      <FormLabel>Motor del equipo</FormLabel>
                      <Input
                        {...field}
                        disabled={readOnly}
                        className="input w-[250px]"
                        placeholder="Ingrese el tipo de motor"
                        value={field.value}
                      />
                      <FormDescription>Ingrese el tipo de motor del equipo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className={cn('flex flex-col min-w-[250px]', form.getValues('type_of_vehicle'))}>
                      <FormLabel>
                        Tipo <span style={{ color: 'red' }}>*</span>{' '}
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={readOnly}
                              value={field.value}
                              className={cn('w-[250px] justify-between', !field.value && 'text-muted-foreground')}
                            >
                              {field.value ? field.value : 'Seleccione tipo'}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0">
                          <Command>
                            <CommandInput
                              onValueChange={(e) => {
                                setType(e);
                              }}
                              placeholder="Buscar tipo..."
                              className="h-9"
                            />
                            <CommandEmpty className="p-1">
                              <AddTypeModal company_id={actualCompany?.id ?? ''} value={type ?? ''} />
                            </CommandEmpty>
                            <CommandGroup>
                              {vehicleType?.map((option) => (
                                <CommandItem
                                  value={option.name}
                                  key={option.name}
                                  onSelect={() => {
                                    form.setValue('type', option.name);
                                  }}
                                >
                                  {option.name}
                                  <CheckIcon
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      option.name === field.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Selecciona el tipo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chassis"
                  render={({ field }) => (
                    <FormItem className={cn('flex flex-col min-w-[250px]', !hideInput && 'hidden')}>
                      <FormLabel>
                        Chasis del equipo<span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        {...field}
                        disabled={readOnly}
                        type="text"
                        className="input w-[250px]"
                        placeholder="Ingrese el chasis"
                        value={field.value !== '' ? field.value : vehicle?.chassis || ''}
                        onChange={(e) => {
                          form.setValue('chassis', e.target.value);
                        }}
                      />
                      <FormDescription>Ingrese el chasis del equipo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serie"
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        'flex flex-col min-w-[250px]',
                        form.getValues('type_of_vehicle') && hideInput && 'hidden'
                      )}
                    >
                      <FormLabel>
                        Serie del equipo<span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        {...field}
                        type="text"
                        disabled={readOnly}
                        className="input w-[250px]"
                        placeholder="Ingrese la serie"
                        onChange={(e) => {
                          form.setValue('serie', e.target.value);
                        }}
                        defaultValue={vehicle?.serie}
                      />

                      <FormDescription>Ingrese la serie del equipo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem className={cn('flex flex-col min-w-[250px]', !hideInput && 'hidden')}>
                      <FormLabel>
                        Dominio del equipo
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        {...field}
                        disabled={readOnly}
                        type="text"
                        className="input w-[250px]"
                        placeholder="Ingrese el dominio"
                        value={field.value !== '' ? field.value ?? '' : vehicle?.domain ?? ''}
                        defaultValue={vehicle?.domain}
                        onChange={(e) => {
                          form.setValue('domain', e.target.value);
                        }}
                      />
                      <FormDescription>Ingrese el dominio del equipo</FormDescription>
                      <FormMessage className="w-[250px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intern_number"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-w-[250px]">
                      <FormLabel>
                        Número interno del equipo
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        {...field}
                        disabled={readOnly}
                        type="text"
                        className="input w-[250px]"
                        placeholder="Ingrese el número interno"
                        value={field.value !== '' ? field.value : vehicle?.intern_number || ''}
                        onChange={(e) => {
                          form.setValue('intern_number', e.target.value);
                        }}
                      />
                      <FormDescription>Ingrese el número interno del equipo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {role !== 'Invitado' && (
                  <div className=" min-w-[250px] flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="allocated_to"
                      render={({ field }) => (
                        <>
                          <CheckboxDefaultValues
                            disabled={readOnly}
                            options={contractorCompanies}
                            required={true}
                            field={field}
                            placeholder="Afectado a"
                          />
                          <FormDescription>Selecciona a quien se le asignará el equipo</FormDescription>
                        </>
                      )}
                    />
                  </div>
                )}
                <div className="w-[300px] flex  gap-2">
                  <FormField
                    control={form.control}
                    name="picture"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormControl>
                          <div className="flex lg:items-center flex-wrap  flex-col lg:flex-row gap-8">
                            <ImageHander
                              labelInput="Subir foto"
                              desciption="Subir foto del equipo"
                              handleImageChange={handleImageChangeWrapper}
                              base64Image={base64Image} //nueva
                              disabled={readOnly}
                              inputStyle={{
                                width: '400px',
                                maxWidth: '300px',
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {!readOnly && (
                <Button type="submit" className="mt-5">
                  {accion === 'edit' || accion === 'view' ? 'Guardar cambios' : 'Agregar equipo'}
                </Button>
              )}
            </form>
          </Form>
        </TabsContent>
        {/* <TabsContent value="documents"> */}
        {/* <DocumentEquipmentComponent id={vehicle?.id} /> */}
        {/* </TabsContent> */}
        {/* <TabsContent value="repairs" className="px-3 py-2"> */}
        {children}
        {/* </TabsContent> */}
        <TabsContent value="QR" className="px-3 py-2 pt-5">
          <div className="flex w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center space-y-4">
                <>
                  <div ref={qrCodeRef}>
                    <QRCode id="vehicle-qr-code" value={qrUrl} size={300} level="H" />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={downloadQRWrapper} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                    <Button onClick={printQRWrapper} size="sm">
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(qrUrl);
                        toast.success('URL copiada al portapapeles');
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar url
                    </Button>
                  </div>
                </>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del QR</h3>
                <p className="text-sm text-gray-600">
                  Este código QR contiene un enlace único a la información de este equipo. Al escanearlo, se puede
                  acceder rápidamente a:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                  <li>Especificaciones técnicas del equipo</li>
                  <li>Historial de mantenimiento y reparaciones</li>
                  <li>Registrar mantenimientos y reparaciones futuras</li>
                  <li>Documentación y certificados</li>
                </ul>
                <div className="bg-green-50 p-4 rounded-md flex items-start space-x-3">
                  <Info className="w-5 h-5 text-green-500 mt-0.5" />
                  <p className="text-sm text-green-700">
                    Asegurate de escanear este código QR con la camara de tu dispositivo o con una aplicación de lectura
                    de QR como Google Lens o QR Code Reader.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
