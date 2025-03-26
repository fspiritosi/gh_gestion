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
import { useState, useEffect } from "react"
import moment from "moment"

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
  handleSaveToDailyReport: () => Promise<void>
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

  const { handleSubmit, control, setValue, watch, reset } = formMethods

  useEffect(() => {
    if (initialData) {
      // Primero establecemos el cliente para que se carguen los datos dependientes
      setValue("customer", initialData.customer)
      handleSelectCustomer(initialData.customer || "", new Date(reportDate))

      // Luego establecemos el servicio para que se carguen los items
      setValue("services", initialData.services)

      // Esperamos un momento para que se carguen los datos dependientes
      setTimeout(() => {
        handleSelectService(initialData.services)

        // Ahora establecemos el resto de los valores
        setValue("working_day", initialData.working_day)
        setValue("employees", initialData.employees || [])
        setValue("equipment", initialData.equipment || [])
        setValue("item", initialData.item)

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
      }, 100)
    }
  }, [initialData, setValue, reportDate])

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

      // Reset dependent selects
      setValue("services", "")
      setValue("item", "")
      setValue("employees", [])
      setValue("equipment", [])
      setCustomerItems([])
      setSelectedService(null)
    }
  }

  const handleSelectService = (serviceId: string) => {
    const service = services.find((s: Services) => s.id === serviceId)
    if (service) {
      setSelectedService(service)

      const filteredItems = items.filter((item: Items) => item.customer_service_id.id === serviceId)
      setCustomerItems(filteredItems)

      // Reset dependent selects
      setValue("item", "")
    }
  }

  const handleWorkingDayChange = (value: string) => {
    setWorkingDay(value)
  }

  const handleValueChange = (value: string) => {
    if (value === "reprogramado" || value === "ejecutado") {
      // La lógica para abrir el diálogo ya está en el componente principal
    }
  }

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
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleSelectCustomer(value, new Date(reportDate))
                    }}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Seleccione un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {customers?.map((customer: Customers) => (
                          <SelectItem key={customer.id} value={customer.id}>
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
                    description="Selecciona un parte diario para reprogramar este reporte."
                    isOpen={isDialogOpen}
                    onClose={handleCloseDialog}
                  >
                    <div className="max-w-[45vw] mx-auto">
                      <Select onValueChange={(value) => setSelectedDate(value)}>
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
                        <Button onClick={handleSaveToDailyReport} disabled={!selectedDate}>
                          Guardar
                        </Button>
                      </div>
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

