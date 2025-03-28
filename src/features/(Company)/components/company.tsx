import CompanyComponent from './ui/CompanyComponent';
import DangerZoneComponent from './ui/_DangerZoneComponent';
import { fetchCurrentCompany } from '@/shared/actions/company.actions';
export async function Company() {
  const companyData = await fetchCurrentCompany();
  return (
    <div>
      <CompanyComponent companyData={companyData} />
      <DangerZoneComponent currentCompanyName={companyData?.[0]?.company_name ?? ''} />
    </div>
  );
}
