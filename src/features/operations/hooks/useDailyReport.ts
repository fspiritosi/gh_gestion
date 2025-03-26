
import { useEffect, useState } from "react";
import { fetchCompanyName, fetchEmployees, fetchCustomers, fetchEquipment, fetchServices, fetchItems, fetchDiagrams } from "@/features/operations/utils/utils";
import { DailyReportData, Customers, Services, Items, Employee, Equipment, Diagram, DailyReportItem } from "@/features/operations/types/types";

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


