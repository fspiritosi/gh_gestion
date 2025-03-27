import {
  Customers,
  DailyReportData,
  DailyReportItem,
  Diagram,
  Employee,
  Equipment,
  Items,
  Services,
} from '@/features/operations/types/types';
import {
  fetchCompanyName,
  fetchCustomers,
  fetchDiagrams,
  fetchEmployees,
  fetchEquipment,
  fetchItems,
  fetchServices,
} from '@/features/operations/utils/utils';
import { useEffect, useState } from 'react';

export function useDailyReport(reportData: DailyReportData | null) {
  const [companyData, setCompanyData] = useState<any>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [services, setServices] = useState<Services[]>([]);
  const [items, setItems] = useState<Items[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [diagram, setDiagram] = useState<Diagram[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyReportItem[]>(reportData?.dailyreportrows || []);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCompanyName(setCompanyData, setCompanyName);
    fetchEmployees(setEmployees);
    fetchCustomers(setCustomers, setIsLoading);
    fetchEquipment(setEquipment);
    fetchServices(setServices);
    fetchItems(setItems);
    fetchDiagrams(setDiagram);
  }, []);

  return {
    companyName,
    employees,
    customers,
    services,
    items,
    equipment,
    diagram,
    dailyReport,
    setDailyReport,
    isLoading,
  };
}
