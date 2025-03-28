import { ItemCompany } from './itemCompany';

export default function CompanyComponent({ companyData }: { companyData: any }) {
  return (
    <div>
      {companyData && (
        <div>
          <ItemCompany name="Razón Social" info={companyData[0].company_name} />
          <ItemCompany name="CUIT" info={companyData[0].company_cuit} />
          <ItemCompany name="Dirección" info={companyData[0].address} />
          <ItemCompany name="Pais" info={companyData[0].country} />
          <ItemCompany name="Ciudad" info={companyData[0].city?.name} />
          <ItemCompany name="Industria" info={companyData[0].industry} />
          <ItemCompany name="Teléfono de contacto" info={companyData[0].contact_phone} />
          <ItemCompany name="Email de contacto" info={companyData[0].contact_email} />
        </div>
      )}
    </div>
  );
}
