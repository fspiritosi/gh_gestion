"use client"

import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FormProvider, useForm } from "react-hook-form"
import MultiSelect from "./MultiSelect"
import { dailyReportSchema } from "@/zodSchemas/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import GenericDialog from "./GenericDialog"
import type {
  Customers,
  Services,
  Items,
  Employee,
  Equipment,
  DailyReportItem,
} from "@/features/operations/types/types"
import { useState, useEffect, useRef } from "react"
import moment from "moment"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface DailyReportFormProps {
  editingId: string | null
  initialData?: DailyReportItem | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  customers: Customers[]
  services: Services[]
  items: Items[]
  employees: Employee[]
  equipment: Equipment[]
  reportDate: Date | string
  diagram: any[]
  isDialogOpen: boolean
  handleCloseDialog: () => void
  futureReports: any[]
  selectedDate: string | null
  setSelectedDate: (date: string) => void
  handleSaveToDailyReport: (options?: { newReportId?: string; newReportDate?: string }) => Promise<boolean>
  setIsDialogOpen: (isOpen: boolean) => void
  onCreateNewReport: (date: string) => Promise<any>
  isLoadingReports?: boolean
  handleStatusChange?: (value: string) => void
}

export default function DailyReportForm({
  editingId,
  initialData,
  onSubmit,
  onCancel,
  customers,
  services,
  items,
  employees,
  equipment,
  reportDate,
  diagram,
  isDialogOpen,
  handleCloseDialog,
  futureReports,
  selectedDate,
  setSelectedDate,
  handleSaveToDailyReport,
  setIsDialogOpen,
  onCreateNewReport,
  isLoadingReports = false,
  handleStatusChange,
}: DailyReportFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customers | null>(null)
  const [customerEmployees, setCustomerEmployees] = useState<Employee[]>([])
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [customerEquipment, setCustomerEquipment] = useState<Equipment[]>([])
  const [customerServices, setCustomerServices] = useState<Services[]>([])
  const [selectedService, setSelectedService] = useState<Services | null>(null)
  const [customerItems, setCustomerItems] = useState<Items[]>([])
  const [workingDay, setWorkingDay] = useState<string>("")
  const [newReportDate, setNewReportDate] = useState<string>("")
  const [isInitialized, setIsInitialized] = useState(false)
  const [formInitializedRef] = useState(useRef(false))
  const [isCreatingReport, setIsCreatingReport] = useState(false)

  const formMethods = useForm<DailyReportItem>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      customer: undefined,
      employees: [],
      equipment: [],
      working_day: "",
      services: "",
      item: "",
      start_time: "",
      end_time: "",
      status: "pendiente",
      description: "",
    },
  })

  const { handleSubmit, control, setValue, watch, reset, getValues } = formMethods

  // Este efecto se ejecuta cuando cambia initialData
  useEffect(() => {
    if (initialData && !formInitializedRef.current) {
      formInitializedRef.current = true
      console.log("Inicializando formulario con datos:", initialData)

      // Resetear el formulario con los valores iniciales
      reset({
        customer: String(initialData.customer),
        services: initialData.services,
        item: initialData.item,
        employees: initialData.employees || [],
        equipment: initialData.equipment || [],
        working_day: initialData.working_day || "",
        status: initialData.status || "pendiente",
        description: initialData.description || "",
        start_time: initialData.start_time?.slice(0, 5) || "",
        end_time: initialData.end_time?.slice(0, 5) || "",
      })

      // Inicializar estados locales
      setWorkingDay(initialData.working_day || "")
      setStartTime(initialData.start_time?.slice(0, 5) || "")
      setEndTime(initialData.end_time?.slice(0, 5) || "")

      // Inicializar datos dependientes con un pequeño retraso para asegurar que el formulario esté listo
      setTimeout(() => {
        initializeFormData()
      }, 100)
    }

    // Limpiar la referencia cuando se desmonta el componente o cambia initialData
    return () => {
      formInitializedRef.current = false
    }
  }, [initialData, reset])

  // Función para inicializar datos dependientes
  const initializeFormData = async () => {
    if (!initialData) return

    try {
      console.log("Inicializando datos dependientes...")

      // Paso 1: Inicializar cliente y sus dependencias
      const customerId = String(initialData.customer)
      console.log("Cliente ID a inicializar:", customerId)

      // Encontrar el cliente en la lista
      const customer = customers.find((c) => String(c.id) === customerId)
      if (customer) {
        setSelectedCustomer(customer)
        console.log("Cliente encontrado:", customer.name)

        // Filtrar empleados para este cliente
        const filteredEmployees = employees.filter((employee: Employee) => {
          const isAllocatedToCustomer = employee.allocated_to?.includes(customer.id)
          const isActiveOnReportDate = diagram.some((diagram) => {
            const diagramDate = new Date(diagram.year, diagram.month - 1, diagram.day)
            return (
              diagramDate.getFullYear() === new Date(reportDate).getFullYear() &&
              diagramDate.getMonth() === new Date(reportDate).getMonth() &&
              diagramDate.getDate() === new Date(reportDate).getDate() &&
              diagram.diagram_type.work_active &&
              diagram.employee_id === employee.id
            )
          })
          return isAllocatedToCustomer && isActiveOnReportDate
        })
        setCustomerEmployees(filteredEmployees)

        // Filtrar equipos para este cliente
        const filteredEquipment = equipment.filter((equipment: Equipment) => {
          const isAllocatedToCustomer = equipment.allocated_to?.includes(customer.id)
          const isNotUnderRepair = !(equipment.condition === "en reparación" || equipment.condition === "no operativo")
          return isAllocatedToCustomer && isNotUnderRepair
        })
        setCustomerEquipment(filteredEquipment)

        // Filtrar servicios para este cliente
        const filteredServices = services.filter((service: Services) => {
          const serviceStartDate = new Date(service.service_start)
          const serviceValidityDate = new Date(service.service_validity)
          const reportDateObj = new Date(reportDate)
          return (
            service.customer_id === customerId &&
            service.is_active &&
            reportDateObj >= serviceStartDate &&
            reportDateObj <= serviceValidityDate
          )
        })
        setCustomerServices(filteredServices)
        console.log("Servicios filtrados:", filteredServices.length)

        // Esperar a que se actualice el estado de los servicios
        await new Promise((resolve) => setTimeout(resolve, 50))

        // Paso 2: Inicializar servicio y sus dependencias
        if (initialData.services) {
          const serviceId = initialData.services
          console.log("Servicio ID a inicializar:", serviceId)

          const service = services.find((s) => s.id === serviceId)
          if (service) {
            setSelectedService(service)
            console.log("Servicio encontrado:", service.service_name)

            // Filtrar items para este servicio
            const filteredItems = items.filter((item: Items) => item.customer_service_id.id === serviceId)
            setCustomerItems(filteredItems)
            console.log("Items filtrados:", filteredItems.length)

            // Esperar a que se actualice el estado de los items
            await new Promise((resolve) => setTimeout(resolve, 50))
          }
        }

        // Paso 3: Asegurarse de que todos los valores del formulario estén establecidos
        setValue("customer", String(initialData.customer))
        setValue("services", initialData.services)
        setValue("item", initialData.item)
        setValue("employees", initialData.employees || [])
        setValue("equipment", initialData.equipment || [])
        setValue("working_day", initialData.working_day || "")

        // Normalizar el valor de working_day
        const normalizedWorkingDay = initialData.working_day?.trim().toLowerCase()
        setWorkingDay(initialData.working_day || "")

        // Verificar si la jornada es de 8 o 12 horas y poner en vacío la hora de inicio y fin
        if (normalizedWorkingDay === "jornada 8 horas" || normalizedWorkingDay === "jornada 12 horas") {
          setValue("start_time", "")
          setValue("end_time", "")
        } else {
          const startTime = initialData.start_time?.slice(0, 5) || ""
          const endTime = initialData.end_time?.slice(0, 5) || ""
          setValue("start_time", startTime)
          setValue("end_time", endTime)
          setStartTime(startTime)
          setEndTime(endTime)
        }

        setValue("status", initialData.status || "pendiente")
        setValue("description", initialData.description || "")

        console.log("Formulario inicializado completamente")
      }

      setIsInitialized(true)
    } catch (error) {
      console.error("Error al inicializar datos del formulario:", error)
    }
  }

  const handleSelectCustomer = (customerId: string, reportDate: Date) => {
    const customer = customers.find((c: Customers) => c.id.toString() === customerId)
    if (customer) {
      setSelectedCustomer(customer)

      const filteredEmployees = employees.filter((employee: Employee) => {
        const isAllocatedToCustomer = employee.allocated_to?.includes(customer.id)
        const isActiveOnReportDate = diagram.some((diagram) => {
          const diagramDate = new Date(diagram.year, diagram.month - 1, diagram.day)
          return (
            diagramDate.getFullYear() === reportDate.getFullYear() &&
            diagramDate.getMonth() === reportDate.getMonth() &&
            diagramDate.getDate() === reportDate.getDate() &&
            diagram.diagram_type.work_active &&
            diagram.employee_id === employee.id
          )
        })
        return isAllocatedToCustomer && isActiveOnReportDate
      })
      setCustomerEmployees(filteredEmployees)

      const filteredEquipment = equipment.filter((equipment: Equipment) => {
        const isAllocatedToCustomer = equipment.allocated_to?.includes(customer.id)
        const isNotUnderRepair = !(equipment.condition === "en reparación" || equipment.condition === "no operativo")
        return isAllocatedToCustomer && isNotUnderRepair
      })
      setCustomerEquipment(filteredEquipment)

      const filteredServices = services.filter((service: Services) => {
        const serviceStartDate = new Date(service.service_start)
        const serviceValidityDate = new Date(service.service_validity)
        return (
          service.customer_id === customerId &&
          service.is_active &&
          reportDate >= serviceStartDate &&
          reportDate <= serviceValidityDate
        )
      })

      setCustomerServices(filteredServices)

      // No reseteamos los valores si estamos en modo edición y ya tenemos valores iniciales
      if (!initialData) {
        // Reset dependent selects
        setValue("services", "")
        setValue("item", "")
        setValue("employees", [])
        setValue("equipment", [])
        setCustomerItems([])
        setSelectedService(null)
      }
    }
  }

  const handleSelectService = (serviceId: string) => {
    const service = services.find((s: Services) => s.id === serviceId)
    if (service) {
      setSelectedService(service)

      const filteredItems = items.filter((item: Items) => item.customer_service_id.id === serviceId)
      setCustomerItems(filteredItems)

      // No reseteamos el item si estamos en modo edición y ya tenemos un valor inicial
      if (!initialData || !initialData.item) {
        setValue("item", "")
      }
    }
  }

  const handleWorkingDayChange = (value: string) => {
    setWorkingDay(value)
  }

  const handleValueChange = (value: string) => {
    console.log("Estado seleccionado:", value)

    if (handleStatusChange) {
      handleStatusChange(value)
    } else if (value === "reprogramado" || value === "ejecutado") {
      console.log("Abriendo diálogo para", value)
      setIsDialogOpen(true)
    }
  }

  // Función para crear un nuevo reporte
  const handleCreateNewReport = async () => {
    if (!newReportDate) return

    try {
      setIsCreatingReport(true)

      // Mostrar toast de carga
      toast({
        title: "Creando parte diario",
        description: "Espere mientras se crea el nuevo parte diario...",
      })

      // Llamar a la función para crear un nuevo parte diario
      const newReportId = await onCreateNewReport(newReportDate)

      if (newReportId) {
        // Si se creó correctamente, establecer como fecha seleccionada
        setSelectedDate(newReportId)

        toast({
          title: "Éxito",
          description: `Parte diario creado para ${moment(newReportDate).format("DD/MM/YYYY")}. Reprogramando...`,
        })

        // Y guardar la reprogramación
        await handleSaveToDailyReport({
          newReportId,
          newReportDate,
        })

        // Cerrar el diálogo después de completar
        handleCloseDialog()
      }
      setIsCreatingReport(false)
    } catch (error) {
      console.error("Error al crear nuevo parte diario:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el parte diario",
        variant: "destructive",
      })
      setIsCreatingReport(false)
    }
  }

  // Verificar si el cliente está seleccionado
  const customerValue = watch("customer")
  console.log("Valor actual del cliente en el formulario:", customerValue)

  // Monitorear cambios en el estado
  const currentStatus = watch("status")
  console.log("Estado actual:", currentStatus)

  return (
    <div className="pr-4 overflow-hidden">
      <h1 className="text-2xl font-bold mb-4">{editingId ? "Editar Fila" : "Agregar Nueva Fila"}</h1>
      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="customer"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => {
                      console.log("Cliente seleccionado:", value)
                      field.onChange(value)
                      handleSelectCustomer(value, new Date(reportDate))
                    }}
                    defaultValue={initialData?.customer ? String(initialData.customer) : undefined}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Seleccione un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {customers?.map((customer: Customers) => (
                          <SelectItem key={customer.id} value={String(customer.id)}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.error && <p className="text-red-500">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="services"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Servicios</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleSelectService(value)
                    }}
                    defaultValue={initialData?.services}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Seleccione el servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Servicios</SelectLabel>
                        {customerServices?.map((service: Services) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.service_name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.error && <p className="text-red-500">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="item"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Items</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} defaultValue={initialData?.item}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Seleccione un item" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Items</SelectLabel>
                        {customerItems?.map((item: Items) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.item_name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.error && <p className="text-red-500">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="employees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block w-full max-w-xs">Empleados</FormLabel>
                  <div className="w-full max-w-xs">
                    <MultiSelect
                      multiEmp={customerEmployees.map((employee: Employee) => ({
                        id: employee.id,
                        name: `${employee.firstname} ${employee.lastname}`,
                      }))}
                      placeholder="Seleccione empleados"
                      selectedItems={field.value}
                      onChange={(selected: any) => field.onChange(selected)}
                    />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block w-full max-w-xs">Equipos</FormLabel>
                  <MultiSelect
                    multiEmp={customerEquipment.map((eq: Equipment) => ({
                      id: eq.id,
                      intern_number: eq.intern_number.toString(),
                    }))}
                    placeholder="Seleccione equipos"
                    selectedItems={field.value}
                    onChange={(selected: any) => field.onChange(selected)}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="working_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jornada</FormLabel>
                  <Select
                    value={field.value || workingDay}
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleWorkingDayChange(value)
                    }}
                    defaultValue={initialData?.working_day}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Tipo de jornada" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="jornada 8 horas">Jornada 8 horas</SelectItem>
                        <SelectItem value="jornada 12 horas">Jornada 12 horas</SelectItem>
                        <SelectItem value="por horario">Por horario</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {isDialogOpen && (
              <>
                {watch("status") === "reprogramado" && (
                  <GenericDialog
                    title="Reprogramar Reporte"
                    description="Selecciona un parte diario para reprogramar este reporte o crea uno nuevo."
                    isOpen={isDialogOpen}
                    onClose={() => {
                      handleCloseDialog()
                      setSelectedDate("")
                      setNewReportDate("")
                    }}
                  >
                    <div className="max-w-[45vw] mx-auto">
                      {isLoadingReports ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                          <p>Cargando partes diarios futuros...</p>
                        </div>
                      ) : futureReports && futureReports.length > 0 ? (
                        <>
                          <p className="mb-2">Partes diarios disponibles ({futureReports.length}):</p>
                          <Select
                            onValueChange={(value) => {
                              console.log("Reporte futuro seleccionado:", value)
                              setSelectedDate(value)
                            }}
                            value={selectedDate || ""}
                          >
                            <SelectTrigger className="w-full max-w-xs">
                              <SelectValue placeholder="Seleccione un parte diario" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {futureReports.map((futureReport) => (
                                  <SelectItem key={futureReport.id} value={futureReport.id}>
                                    {moment(futureReport.date).format("DD/MM/YYYY")}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <div className="mt-4 flex justify-center w-full">
                            <Button variant="outline" onClick={handleCloseDialog} className="mr-2">
                              Cerrar
                            </Button>
                            <Button
                              onClick={async () => {
                                try {
                                  console.log("Iniciando reprogramación...")
                                  const success = await handleSaveToDailyReport()
                                  if (success) {
                                    console.log("Reprogramación exitosa")
                                  }
                                } catch (error) {
                                  console.error("Error al reprogramar:", error)
                                }
                              }}
                              disabled={!selectedDate}
                            >
                              Guardar
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <p className="mb-4">No hay partes diarios futuros disponibles.</p>
                          <div className="mb-4">
                            <p className="mb-2">Seleccione una fecha para crear un nuevo parte diario:</p>
                            <div className="flex justify-center">
                              <input
                                type="date"
                                className="border rounded p-2"
                                min={moment().add(1, "day").format("YYYY-MM-DD")}
                                onChange={(e) => setNewReportDate(e.target.value)}
                                value={newReportDate}
                              />
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <Button variant="outline" onClick={handleCloseDialog} className="mr-2">
                              Cancelar
                            </Button>
                            <Button onClick={handleCreateNewReport} disabled={!newReportDate || isCreatingReport}>
                              {isCreatingReport ? "Creando..." : "Crear y Reprogramar"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </GenericDialog>
                )}
                {watch("status") === "ejecutado" && (
                  <GenericDialog
                    title="Confirmar Estado Ejecutado"
                    description="Si se pasa el estado a ejecutado, no se podrá modificar más."
                    isOpen={isDialogOpen}
                    onClose={handleCloseDialog}
                  >
                    <div className="max-w-[45vw] mx-auto">
                      <div className="mt-4 flex justify-center w-full">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setValue("status", "pendiente")
                            handleCloseDialog()
                          }}
                          className="mr-2"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => {
                            handleCloseDialog()
                          }}
                        >
                          Aceptar
                        </Button>
                      </div>
                    </div>
                  </GenericDialog>
                )}
              </>
            )}
            {workingDay === "por horario" && (
              <>
                <FormField
                  control={control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de inicio</FormLabel>
                      <Input
                        type="time"
                        name="start_time"
                        value={startTime ? startTime : field.value}
                        onChange={(e) => {
                          setStartTime(e.target.value)
                          field.onChange(e.target.value)
                        }}
                        className="w-full max-w-xs"
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de finalización</FormLabel>
                      <Input
                        type="time"
                        name="end_time"
                        value={field.value || endTime}
                        onChange={(e) => {
                          setEndTime(e.target.value)
                          field.onChange(e.target.value)
                        }}
                        className="w-full max-w-xs"
                      />
                    </FormItem>
                  )}
                />
              </>
            )}

            {editingId && (
              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleValueChange(value)
                      }}
                      defaultValue={initialData?.status}
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="ejecutado">Ejecutado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="reprogramado">Reprogramado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="w-full max-w-xs">Descripción</FormLabel>
                  <Textarea placeholder="Ingrese una breve descripción" className="resize-none" {...field} />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full max-w-xs">
              {editingId ? "Guardar Cambios" : "Agregar Fila"}
            </Button>
            <Button type="button" onClick={onCancel} variant="outline" className="w-full max-w-xs">
              Cancelar
            </Button>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}

