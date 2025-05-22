'use server';
import { DailyReportRowHistoryRecord, ProcessedHistoryEntry } from '@/app/server/colections';
import { supabaseServer } from '@/lib/supabase/server';
import moment from 'moment';
import { cookies } from 'next/headers';

// export async function updateDailyReportStatus(id: string, status: string) {
//   const supabase = supabaseServer();
//   const { data, error } = await supabase
//     .from('dailyreport')
//     .update({
//       status: status,
//     })
//     .eq('id', id)
//     .select();

//   if (error) {
//     throw new Error(error.message);
//   }
//   return data;
// }

// En actions.ts
export async function fetchDailyReportsWithFilters({
  fromDate,
  toDate,
  status,
}: {
  fromDate?: string;
  toDate?: string;
  status?: string[] | null;
}) {
  const supabase = supabaseServer();

  let query = supabase.from('dailyreport').select(`*,dailyreportrows(status)`).order('date', { ascending: false });

  // Aplicar filtros de fecha si existen
  if (fromDate) {
    query = query.gte('date', fromDate);
  }

  if (toDate) {
    query = query.lte('date', toDate);
  }

  // Aplicar filtro de estado si existe
  if (status && status.length > 0) {
    query = query.in('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching daily reports:', error);
    throw error;
  }

  return data;
}
export async function getDailyReports() {
  const supabase = supabaseServer();

  let { data: dailyReports, error } = await supabase
    .from('dailyreport')
    .select(`*,dailyreportrows(status)`)

    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching daily reports:', error);
    return [];
  }

  return dailyReports || [];
}
export async function getDailyReportsForCurrentMonth() {
  const supabase = supabaseServer();

  let { data: dailyReports, error } = await supabase
    .from('dailyreport')
    .select(`*,dailyreportrows(status)`)
    .gte('date', moment().startOf('month').format('YYYY-MM-DD'))
    .lte('date', moment().endOf('month').format('YYYY-MM-DD'))
    .order('date', { ascending: false });

  console.log(dailyReports);

  if (error) {
    console.error('Error fetching daily reports:', error);
    return [];
  }

  return dailyReports || [];
}

export async function getDailyReportRowHistory(dailyReportId: string) {
  const supabase = supabaseServer();
  const { data: history, error } = await supabase
    .rpc('get_dailyreportrow_history', { p_row_id: dailyReportId })
    .returns<DailyReportRowHistoryRecord[]>();

  if (error) {
    console.error('Error fetching daily report row history:', error);
    return [];
  }

  const processedHistory = history?.map((record) => {
    const entry: ProcessedHistoryEntry = {
      id: record.id,
      actionType: record.action_type,
      timestamp: record.created_at,
      user: record.changed_by
        ? {
            id: record.changed_by.id,
            email: record.changed_by.email,
            name: record.changed_by.raw_user_meta_data?.full_name || record.changed_by.email,
          }
        : null,
      changes: [],
      relatedTable: record.related_table,
      relatedId: record.related_id,
      message: '',
      displayTime: new Date(record.created_at).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Get user info for message - asignar "Sistema" si no hay usuario
    const userName = entry.user?.name || 'El Sistema';

    if (record.action_type === 'UPDATE' && record.changed_fields) {
      const changedFieldMessages: string[] = [];

      Object.entries(record.changed_fields).forEach(([field, change]: [string, any]) => {
        // Add Spanish field names for known fields
        let fieldName = field;
        let oldValueDisplay = change.old;
        let newValueDisplay = change.new;

        // Translate field names
        switch (field) {
          case 'customer_id':
            fieldName = 'Cliente';
            break;
          case 'service_id':
            fieldName = 'Servicio';
            break;
          case 'item_id':
            fieldName = 'Item';
            break;
          case 'working_day':
            fieldName = 'Jornada';
            break;
          case 'remit_number':
            fieldName = 'Remito';
            // Special format for remit number - just show the new value
            changedFieldMessages.push(`${fieldName}: "${newValueDisplay || 'Sin valor'}"`);
            // Skip the default format
            entry.changes.push({
              field,
              fieldName,
              oldValue: change.old,
              newValue: change.new,
              oldValueDisplay,
              newValueDisplay,
            });
            return; // Skip the default message for this field
          case 'start_time':
            fieldName = 'Hora inicio';
            break;
          case 'end_time':
            fieldName = 'Hora fin';
            break;
          case 'description':
            fieldName = 'Descripción';
            break;
          case 'cancel_reason':
            fieldName = 'Razón';
            // Special format for cancel reason - just show the new value
            changedFieldMessages.push(`${fieldName}: "${newValueDisplay || 'Sin valor'}"`);
            // Skip the default format
            entry.changes.push({
              field,
              fieldName,
              oldValue: change.old,
              newValue: change.new,
              oldValueDisplay,
              newValueDisplay,
            });
            return; // Skip the default message for this field
          case 'status':
            fieldName = 'Estado';
            // Translate status values
            if (oldValueDisplay === 'pendiente') oldValueDisplay = 'Pendiente';
            if (oldValueDisplay === 'ejecutado') oldValueDisplay = 'Ejecutado';
            if (oldValueDisplay === 'cancelado') oldValueDisplay = 'Cancelado';
            if (oldValueDisplay === 'reprogramado') oldValueDisplay = 'Reprogramado';
            if (oldValueDisplay === 'sin_recursos_asignados') oldValueDisplay = 'Sin recursos asignados';

            if (newValueDisplay === 'pendiente') newValueDisplay = 'Pendiente';
            if (newValueDisplay === 'ejecutado') newValueDisplay = 'Ejecutado';
            if (newValueDisplay === 'cancelado') newValueDisplay = 'Cancelado';
            if (newValueDisplay === 'reprogramado') newValueDisplay = 'Reprogramado';
            if (newValueDisplay === 'sin_recursos_asignados') newValueDisplay = 'Sin recursos asignados';
            break;
          case 'type_service':
            fieldName = 'Tipo de servicio';
            // Translate type_service values
            if (oldValueDisplay === 'mensual') oldValueDisplay = 'Mensual';
            if (oldValueDisplay === 'adicional') oldValueDisplay = 'Adicional';

            if (newValueDisplay === 'mensual') newValueDisplay = 'Mensual';
            if (newValueDisplay === 'adicional') newValueDisplay = 'Adicional';
            break;
          default:
            fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            break;
        }

        // Add the change message showing old and new values
        changedFieldMessages.push(
          `${fieldName} de "${oldValueDisplay || 'Sin valor'}" a "${newValueDisplay || 'Sin valor'}"`
        );

        entry.changes.push({
          field,
          fieldName,
          oldValue: change.old,
          newValue: change.new,
          oldValueDisplay,
          newValueDisplay,
        });
      });

      // Create Spanish message with detailed changes
      entry.message = `${userName} modificó: ${changedFieldMessages.join(', ')}`;
    } else if (record.action_type === 'LINK' || record.action_type === 'UNLINK') {
      const relationType = record.related_table;
      const relationData = record.changed_data;
      const action = record.action_type === 'LINK' ? 'agregó' : 'eliminó';

      if (relationType === 'dailyreport_customer_equipment_relations') {
        const equipmentName = relationData?.equipo_nombre || 'Equipo desconocido';

        entry.changes.push({
          type: 'equipment_relation',
          action: record.action_type === 'LINK' ? 'added' : 'removed',
          equipment: {
            id: relationData?.equipo_id,
            name: equipmentName,
            identifier: relationData?.equipo_identificador,
          },
        });

        entry.message = `${userName} ${action} el equipo del cliente: ${equipmentName}`;
      } else if (relationType === 'dailyreportemployeerelations') {
        const employeeName = relationData?.empleado_nombre || 'Empleado desconocido';

        entry.changes.push({
          type: 'employee_relation',
          action: record.action_type === 'LINK' ? 'added' : 'removed',
          employee: {
            id: relationData?.empleado_id,
            name: employeeName,
          },
        });

        entry.message = `${userName} ${action} el empleado: ${employeeName}`;
      } else if (relationType === 'dailyreportequipmentrelations') {
        const vehicleName = relationData?.vehiculo_dominio || 'Vehículo desconocido';

        entry.changes.push({
          type: 'vehicle_relation',
          action: record.action_type === 'LINK' ? 'added' : 'removed',
          vehicle: {
            id: relationData?.vehiculo_id,
            domain: relationData?.vehiculo_dominio,
            internNumber: relationData?.vehiculo_numero_interno,
          },
        });

        entry.message = `${userName} ${action} el vehículo: ${vehicleName}`;
      }
    } else if (record.action_type === 'CREATE') {
      // Traducir los nombres de los campos para los registros CREATE
      const translatedData: Record<string, any> = {};

      if (record.changed_data) {
        Object.entries(record.changed_data).forEach(([key, value]) => {
          // Traducir nombres de campos
          switch (key) {
            case 'status':
              translatedData['Estado'] =
                value === 'pendiente'
                  ? 'Pendiente'
                  : value === 'ejecutado'
                    ? 'Ejecutado'
                    : value === 'cancelado'
                      ? 'Cancelado'
                      : value === 'reprogramado'
                        ? 'Reprogramado'
                        : value === 'sin_recursos_asignados'
                          ? 'Sin recursos asignados'
                          : value;
              break;
            case 'item_name':
              translatedData['Item'] = value;
              break;
            case 'working_day':
              translatedData['Jornada'] = value;
              break;
            case 'service_name':
              translatedData['Servicio'] = value;
              break;
            case 'type_service':
              translatedData['Tipo de servicio'] =
                value === 'mensual' ? 'Mensual' : value === 'adicional' ? 'Adicional' : value;
              break;
            case 'customer_name':
              translatedData['Cliente'] = value;
              break;
            case 'description':
              translatedData['Descripción'] = value;
              break;
            case 'remit_number':
              translatedData['Remito'] = value;
              break;
            case 'start_time':
              translatedData['Hora inicio'] = value;
              break;
            case 'end_time':
              translatedData['Hora fin'] = value;
              break;
            case 'cancel_reason':
              translatedData['Razón de cancelación'] = value;
              break;
            default:
              // Para campos no especificados, convertir de snake_case a formato título
              const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
              translatedData[formattedKey] = value;
          }
        });
      }

      entry.changes.push({
        type: 'full_record',
        data: translatedData,
      });

      // Create Spanish message for new record
      const customerName = record.changed_data?.customer_name || '';
      const serviceName = record.changed_data?.service_name || '';
      const itemName = record.changed_data?.item_name || '';

      entry.message = `${userName} creó un nuevo registro para ${customerName} - ${serviceName} - ${itemName}`;
    } else if (record.action_type === 'DELETE') {
      // Traducir los nombres de los campos para los registros DELETE (misma lógica que para CREATE)
      const translatedData: Record<string, any> = {};

      if (record.changed_data) {
        Object.entries(record.changed_data).forEach(([key, value]) => {
          // Traducir nombres de campos
          switch (key) {
            case 'status':
              translatedData['Estado'] =
                value === 'pendiente'
                  ? 'Pendiente'
                  : value === 'ejecutado'
                    ? 'Ejecutado'
                    : value === 'cancelado'
                      ? 'Cancelado'
                      : value === 'reprogramado'
                        ? 'Reprogramado'
                        : value === 'sin_recursos_asignados'
                          ? 'Sin recursos asignados'
                          : value;
              break;
            case 'item_name':
              translatedData['Item'] = value;
              break;
            case 'working_day':
              translatedData['Jornada'] = value;
              break;
            case 'service_name':
              translatedData['Servicio'] = value;
              break;
            case 'type_service':
              translatedData['Tipo de servicio'] =
                value === 'mensual' ? 'Mensual' : value === 'adicional' ? 'Adicional' : value;
              break;
            case 'customer_name':
              translatedData['Cliente'] = value;
              break;
            case 'description':
              translatedData['Descripción'] = value;
              break;
            case 'remit_number':
              translatedData['Remito'] = value;
              break;
            case 'start_time':
              translatedData['Hora inicio'] = value;
              break;
            case 'end_time':
              translatedData['Hora fin'] = value;
              break;
            case 'cancel_reason':
              translatedData['Razón de cancelación'] = value;
              break;
            default:
              // Para campos no especificados, convertir de snake_case a formato título
              const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
              translatedData[formattedKey] = value;
          }
        });
      }

      entry.changes.push({
        type: 'full_record',
        data: translatedData,
      });

      // Create Spanish message for deleted record
      const customerName = record.changed_data?.customer_name || '';
      const serviceName = record.changed_data?.service_name || '';
      const itemName = record.changed_data?.item_name || '';

      entry.message = `${userName} eliminó el registro para ${customerName} - ${serviceName} - ${itemName}`;
    }

    return entry;
  });

  console.log(processedHistory);
  // Sort by timestamp, newest first
  const sortedHistory = processedHistory?.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return sortedHistory || [];
}
export async function getDailyReportById(id: string) {
  const supabase = supabaseServer();

  let { data: dailyReports, error } = await supabase
    .from('dailyreport')
    .select(
      `
    *,
     dailyreportrows(
     dailyreport_customer_equipment_relations(*,equipos_clientes(*)),
     *,
  id,
  service_sectors(*,sectors(*)),
  service_areas(*,areas_cliente(*)),
  customer_services(id,service_name),
  service_items(id,item_name),
  remit_number,
  customers(id, name),
  start_time,
  end_time,
  status,
  working_day,
  description,
  document_path,
  dailyreportemployeerelations(employees(id,firstname,lastname)),
  dailyreportequipmentrelations(vehicles(id,intern_number,domain))
)
        `
    )
    .eq('id', id);

  if (error) {
    console.error('Error fetching daily reports:', error);
    return [];
  }

  return dailyReports || [];
}
export async function checkDailyReportExists(date: string[]) {
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('dailyreport')
    .select('*')
    .in('date', date)
    .eq('company_id', company_id || user?.app_metadata?.company_id || '');

  if (error) {
    console.error('Error checking daily reportsss:', error);
    return [];
  }

  return data;
}
export async function createDailyReport(date: string[]) {
  const supabase = supabaseServer();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('dailyreport')
    .insert(
      date.map((date) => ({
        date,
        company_id: company_id || user?.app_metadata?.company_id || '',
      }))
    )
    .select();

  if (error) {
    return [];
    console.log(error);
  }
  return data;
}
export async function getCustomers() {
  const supabase = supabaseServer();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('customers').select(`
    *,
    equipos_clientes(*),
    customer_services!customer_services_customer_id_fkey(
      *,
      service_sectors(*, sectors(*) ),
      service_areas(*, areas_cliente(*)),
      service_items(*,measure_units(*))  
    )
  `);
  // .eq('company_id', company_id || user?.app_metadata?.company_id || '');
  if (error) {
    console.log(error);
  }
  console.log(
    data?.find((customer) => customer.id === '8af2b620-e8ca-4b97-a198-3514a306d868'),
    'customers'
  );
  return data;
}

export async function getCustomersServices() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('customer_services').select('*');
  if (error) {
    console.log(error);
  }
  return data;
}
export async function getServiceItems() {
  const supabase = supabaseServer();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('service_items').select('*,measure_units(*)');
  // .eq('company_id', company_id || user?.app_metadata?.company_id || '');
  if (error) {
    console.log(error);
  }
  return data;
}

export async function getActiveEmployeesForDailyReport() {
  const supabase = supabaseServer();

  // Obtener la fecha actual
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1; // Los meses en JS van de 0 a 11
  const year = today.getFullYear();

  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('employees')
    .select('employees_diagram!inner(*,diagram_type(*)), contractor_employee(*),*')
    .eq('is_active', true)
    .eq('employees_diagram.day', day)
    .eq('employees_diagram.month', month)
    .eq('employees_diagram.year', year)
    .eq('employees_diagram.diagram_type.work_active', true);

  if (error) {
    console.error('Error al obtener empleados con diagrama:', error);
    return [];
  }

  return data || [];
}
export async function getActiveEquipmentsForDailyReport() {
  const supabase = supabaseServer();
  const cookiesStore = cookies();
  const company_id = cookiesStore.get('actualComp')?.value;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*,contractor_equipment(*)')
    .eq('is_active', true)
    .neq('condition', 'no operativo')
    .neq('condition', 'en reparación')
    .eq('company_id', company_id || user?.app_metadata?.company_id || '');
  if (error) {
    console.error('Error al obtener equipos activos:', error);
    return [];
  }
  return data || [];
}

// Tipos para las relaciones
interface EmployeeRelation {
  id: string;
  employee_id: string;
  daily_report_row_id: string;
  created_at?: string;
}

interface EquipmentRelation {
  id: string;
  equipment_id: string;
  daily_report_row_id: string;
  created_at?: string;
}

// Tipo para la fila del reporte diario
interface DailyReportRowData {
  id?: string;
  daily_report_id: string;
  customer_id: string;
  service_id: string;
  item_id: string;
  working_day: string;
  start_time?: string | null;
  end_time?: string | null;
  description?: string | null;
  areas_customer_id?: string;
  sector_customer_id?: string;
  type_service?: 'mensual' | 'adicional';
  status: DailyReportRowStatus;
}

export async function updateDailyReportRow(
  id: string,
  data: Partial<DailyReportRowData>,
  employeeIds: string[],
  equipmentIds: string[],
  equipos_clienteIds: string[]
) {
  const supabase = supabaseServer();

  // Actualizar la fila principal
  await updateEmployeeRelations(id, employeeIds);

  // Actualizar relaciones de equipos
  await updateEquipmentRelations(id, equipmentIds);

  await updateEquiposClienteRelations(id, equipos_clienteIds);

  console.log({
    ...data,
    status:
      data.status === 'cancelado' ||
      data.status === 'reprogramado' ||
      data.status === 'ejecutado' ||
      employeeIds.length > 0 ||
      equipmentIds.length > 0
        ? data.status
        : 'sin_recursos_asignados',
  });

  const { data: updatedRow, error: updateError } = await supabase
    .from('dailyreportrows')
    .update({
      ...data,
      status:
        data.status === 'cancelado' ||
        data.status === 'reprogramado' ||
        data.status === 'ejecutado' ||
        employeeIds.length > 0 ||
        equipmentIds.length > 0
          ? data.status
          : 'sin_recursos_asignados',
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Error al actualizar la fila:', updateError);
    throw updateError;
  }
  // Actualizar relaciones de empleados

  return updatedRow;
}

export async function updateDailyReportRowStatus(id: string[], status: DailyReportRowStatus) {
  const supabase = supabaseServer();

  const { data, error } = await supabase.from('dailyreportrows').update({ status }).in('id', id).select();

  if (error) {
    console.error('Error updating daily report row status:', error);
    throw error;
  }

  return data;
}

export async function updateEmployeeRelations(rowId: string, employeeIds: string[]) {
  const supabase = supabaseServer();

  try {
    // Obtener relaciones existentes
    const { data: existingRelations, error: fetchError } = await supabase
      .from('dailyreportemployeerelations' as any)
      .select('*')
      .eq('daily_report_row_id', rowId);

    if (fetchError) throw fetchError;

    const currentRelations = (existingRelations || []) as EmployeeRelation[];

    // Encontrar relaciones a eliminar
    const relationsToDelete = currentRelations.filter((rel) => !employeeIds.includes(rel.employee_id));

    // Encontrar empleados a agregar
    const existingEmployeeIds = currentRelations.map((rel) => rel.employee_id);
    const employeeIdsToAdd = employeeIds.filter((id) => !existingEmployeeIds.includes(id));

    // Eliminar relaciones
    if (relationsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('dailyreportemployeerelations' as any)
        .delete()
        .in(
          'id',
          relationsToDelete.map((r) => r.id)
        );

      if (deleteError) throw deleteError;
    }

    // Usar la función existente para crear nuevas relaciones
    if (employeeIdsToAdd.length > 0) {
      await createDailyReportEmployeeRelations(rowId, employeeIdsToAdd);
    }
  } catch (error) {
    console.error('Error en updateEmployeeRelations:', error);
    throw error;
  }
}

export async function updateEquipmentRelations(rowId: string, equipmentIds: string[]) {
  const supabase = supabaseServer();

  try {
    // Obtener relaciones existentes
    const { data: existingRelations, error: fetchError } = await supabase
      .from('dailyreportequipmentrelations' as any)
      .select('*')
      .eq('daily_report_row_id', rowId);

    if (fetchError) throw fetchError;

    const currentRelations = (existingRelations || []) as EquipmentRelation[];

    // Encontrar relaciones a eliminar
    const relationsToDelete = currentRelations.filter((rel) => !equipmentIds.includes(rel.equipment_id));

    // Encontrar equipos a agregar
    const existingEquipmentIds = currentRelations.map((rel) => rel.equipment_id);
    const equipmentIdsToAdd = equipmentIds.filter((id) => !existingEquipmentIds.includes(id));

    // Eliminar relaciones
    if (relationsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('dailyreportequipmentrelations')
        .delete()
        .in(
          'id',
          relationsToDelete.map((r) => r.id)
        );

      if (deleteError) throw deleteError;
    }

    // Usar la función existente para crear nuevas relaciones
    if (equipmentIdsToAdd.length > 0) {
      await createDailyReportEquipmentRelations(rowId, equipmentIdsToAdd);
    }
  } catch (error) {
    console.error('Error en updateEquipmentRelations:', error);
    throw error;
  }
}

export async function updateEquiposClienteRelations(dailyReportRowId: string, equiposClienteIds: string[]) {
  const supabase = supabaseServer();

  try {
    // 1. Obtener relaciones existentes para este daily_report_row
    const { data: existingRelations, error: fetchError } = await supabase
      .from('dailyreport_customer_equipment_relations')
      .select('id, customer_equipment_id')
      .eq('daily_report_row_id', dailyReportRowId);

    if (fetchError) throw fetchError;

    const currentRelations = existingRelations || [];

    // 2. Identificar relaciones a eliminar (están en la BD pero no en los nuevos IDs)
    const currentEquipmentIds = currentRelations.map((rel) => rel.customer_equipment_id);
    const newEquipmentIds = equiposClienteIds || [];

    const relationsToDelete = currentRelations.filter((rel) => !newEquipmentIds.includes(rel.customer_equipment_id));

    // 3. Identificar equipos para los que hay que crear nuevas relaciones
    const equipmentIdsToAdd = newEquipmentIds.filter((id) => !currentEquipmentIds.includes(id));

    // 4. Eliminar relaciones que ya no existen
    if (relationsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('dailyreport_customer_equipment_relations')
        .delete()
        .in(
          'id',
          relationsToDelete.map((r) => r.id)
        );

      if (deleteError) throw deleteError;
    }

    // 5. Crear nuevas relaciones para equipos que no las tenían
    if (equipmentIdsToAdd.length > 0) {
      const newRelations = equipmentIdsToAdd.map((equipmentId) => ({
        daily_report_row_id: dailyReportRowId,
        customer_equipment_id: equipmentId,
      }));

      const { error: insertError } = await supabase
        .from('dailyreport_customer_equipment_relations')
        .insert(newRelations);

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error en updateEquiposClienteRelations:', error);
    throw error;
  }
}
export async function createDailyReportRow(data: Omit<DailyReportRowData, 'id' | 'created_at' | 'updated_at'>[]) {
  const supabase = supabaseServer();

  try {
    // Insertar todas las filas a la vez
    console.log(data);
    const { data: createdRows, error } = await supabase.from('dailyreportrows').insert(data).select('*');

    if (error) throw error;

    // Verificar que se hayan creado las filas
    if (!createdRows || createdRows.length === 0) {
      throw new Error('No se crearon filas');
    }

    return createdRows;
  } catch (error) {
    console.error('Error creando filas de parte diario:', error);
    throw error;
  }
}

export async function createDailyReportEmployeeRelations(dailyReportRowId: string, employeeIds: string[]) {
  if (!employeeIds || employeeIds.length === 0) return [];

  const supabase = supabaseServer();

  const relations = employeeIds.map((employeeId) => ({
    daily_report_row_id: dailyReportRowId,
    employee_id: employeeId,
  }));

  const { data, error } = await supabase.from('dailyreportemployeerelations').insert(relations).select();

  if (error) {
    console.error('Error creating employee relations:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function deleteDailyReportRow(id: string) {
  const supabase = supabaseServer();

  try {
    // Finalmente eliminamos la fila del reporte
    const { error: rowError } = await supabase.from('dailyreportrows').delete().eq('id', id);

    if (rowError) throw rowError;

    return { success: true };
  } catch (error) {
    console.error('Error deleting daily report row:', error);
    throw error;
  }
}

export async function createDailyReportEquipmentRelations(dailyReportRowId: string, equipmentIds: string[]) {
  if (!equipmentIds || equipmentIds.length === 0) return [];

  const supabase = supabaseServer();

  const relations = equipmentIds.map((equipmentId) => ({
    daily_report_row_id: dailyReportRowId,
    equipment_id: equipmentId,
  }));

  console.log(relations);

  const { data, error } = await supabase
    .from('dailyreportequipmentrelations' as any)
    .insert(relations)
    .select();

  if (error) {
    console.error('Error creating equipment relations:', error);
    throw new Error(error.message);
  }

  return data || [];
}
export async function createDailyReportCustomerEquipmentRelations(dailyReportRowId: string, equipmentIds: string[]) {
  if (!equipmentIds || equipmentIds.length === 0) return [];

  const supabase = supabaseServer();

  const relations = equipmentIds.map((equipmentId) => ({
    daily_report_row_id: dailyReportRowId,
    customer_equipment_id: equipmentId,
  }));

  console.log(relations);

  const { data, error } = await supabase.from('dailyreport_customer_equipment_relations').insert(relations).select();

  if (error) {
    console.error('Error creating equipment customers relations:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getCustomersAreas(customerIds: string[]) {
  const supabase = supabaseServer();

  const { data, error } = await supabase.from('areas_cliente').select('*').in('customer_id', customerIds);
  if (error) {
    return [];
    console.log(error);
  }
  return data;
}
export async function getCustomersSectors(customerIds: string[]) {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from('sector_customer')
    .select('*,customers(*),sectors(*)')
    .in('customer_id', customerIds);
  if (error) {
    console.log(error);
    return [];
  }
  return data;
}
