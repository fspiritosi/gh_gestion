import { toast } from '@/components/ui/use-toast';
import { Customers, DailyReportData, Employee, Equipment, Items, Services } from '@/features/operations/types/types';
import cookies from 'js-cookie';

const URL = process.env.NEXT_PUBLIC_BASE_URL;
const company_id = cookies.get('actualComp');

export async function fetchReports(setDailyReports: Function, setIsLoading: Function) {
  setIsLoading(true);
  try {
    const response = await fetch(`${URL}/api/daily-report/table?actual=${company_id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    setDailyReports(data.dailyReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    toast({
      title: 'Error',
      description: 'No se pudieron cargar los reportes diarios.',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
}

export const transformDailyReports = (reports: any[]): DailyReportData[] => {
  return reports.map((report) => ({
    id: report.id,
    date: report.date,
    status: report.status, // Asumiendo que todos los reportes están abiertos por defecto
    dailyreportrows: report.dailyreportrows.map((row: any) => ({
      id: row.id,
      date: report.date,
      customer: row.customer_id?.id,
      employees: row.dailyreportemployeerelations.map((rel: any) => rel.employee_id.id),
      equipment: row.dailyreportequipmentrelations.map((rel: any) => rel.equipment_id.id),
      services: row.service_id.id,
      item: row.item_id.id,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status, // Asumiendo que todos los items están ejecutados por defecto
      working_day: row.working_day,
      description: row.description || '',
      document_path: row.document_path, // Asumiendo que no hay descripción disponible
    })),
  }));
};

export const getCustomerName = (customerId: string, customers: Customers[]): string => {
  const customer = customers?.find((c) => c.id === customerId);
  return customer ? customer.name : 'Unknown';
};

export const getServiceName = (serviceId: string, services: Services[]) => {
  const service = services?.find((s) => s.id === serviceId);
  return service ? service.service_name : 'Unknown';
};

export const getItemName = (itemId: string, items: Items[]) => {
  const item = items?.find((i) => i.id === itemId);
  return item ? item.item_name : 'Unknown';
};
export const getEmployeeNames = (employeeIds: string[], employees: Employee[]) => {
  return employeeIds
    ?.map((id) => {
      const employee = employees?.find((emp) => emp.id === id);
      //console.log(employee)
      return employee ? `${employee.firstname} ${employee.lastname}` : 'Unknown';
    })
    .join(', ');
};

export const getEquipmentNames = (equipmentIds: string[], equipment: Equipment[]) => {
  return equipmentIds
    ?.map((id) => {
      const eq = equipment?.find((e) => e.id === id);
      return eq ? eq.intern_number?.toString() : 'Unknown';
    })
    .join(', ');
};

export const formatTime = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
};

export async function fetchCompanyName(setCompanyData: Function, setCompanyName: Function) {
  try {
    const response = await fetch(`${URL}/api/company?actual=${company_id}`);
    const data = await response.json();
    const companyName = data.data[0].company_name;
    const companyData = data.data[0];
    setCompanyData(companyData);
    setCompanyName(companyName);
    return companyName;
  } catch (error) {
    console.error('Error fetching company name:', error);
  }
}

export async function fetchEmployees(setEmployees: Function) {
  try {
    const { employees } = await fetch(`${URL}/api/employees/?actual=${company_id}`).then((e) => e.json());
    setEmployees(employees);
    return employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
  }
}

export async function fetchCustomers(setCustomers: Function, setIsLoading: Function) {
  try {
    const { customers } = await fetch(`${URL}/api/company/customers/?actual=${company_id}`).then((e) => e.json());
    const activeCustomers = customers.filter((customer: any) => customer.is_active);
    setCustomers(activeCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
  } finally {
    setIsLoading(false);
  }
}

export async function fetchEquipment(setEquipment: Function) {
  try {
    const response = await fetch(`${URL}/api/equipment/?actual=${company_id}`);
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }
    const data = await response.json();
    const activeEquipment = data.equipments.filter((eq: any) => eq.is_active);
    setEquipment(activeEquipment);
    return activeEquipment;
  } catch (error) {
    console.error('Error fetching equipment:', error);
  }
}

export async function fetchServices(setServices: Function) {
  try {
    const { services } = await fetch(`${URL}/api/services?actual=${company_id}`).then((e) => e.json());
    const activeServices = services.filter((service: any) => service.is_active);
    setServices(activeServices);
    return activeServices;
  } catch (error) {
    console.error('Error fetching services:', error);
  }
}

export async function fetchItems(setItems: Function) {
  try {
    const { items } = await fetch(`${URL}/api/services/items/report?actual=${company_id}`).then((e) => e.json());
    setItems(items);
    return items;
  } catch (error) {
    console.error('Error fetching items:', error);
  }
}

export async function fetchDiagrams(setDiagram: Function) {
  try {
    const { data: diagrams } = await fetch(`${URL}/api/employees/diagrams`).then((e) => e.json());
    setDiagram(diagrams);
    return diagrams;
  } catch (error) {
    console.error('Error fetching diagrams:', error);
  }
}
