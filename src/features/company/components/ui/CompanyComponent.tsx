import { fetchCurrentCompany } from '@/shared/actions/company.actions';
import { ItemCompany } from './itemCompany';

export default async function CompanyComponent() {
  const companyData = await fetchCurrentCompany();
  console.log('companyData', companyData);
  return (
    <div>
      {companyData && (
        <div>
          <ItemCompany name="Razón Social" info={companyData.company_name} />
          <ItemCompany name="CUIT" info={companyData.company_cuit} />
          <ItemCompany name="Dirección" info={companyData.address} />
          <ItemCompany name="Pais" info={companyData.country} />
          <ItemCompany name="Ciudad" info={companyData.city?.name} />
          <ItemCompany name="Industria" info={companyData.industry} />
          <ItemCompany name="Teléfono de contacto" info={companyData.contact_phone} />
          <ItemCompany name="Email de contacto" info={companyData.contact_email} />
        </div>
      )}
    </div>
  );
}
