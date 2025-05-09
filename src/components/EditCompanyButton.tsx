'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Company {
  companyId: string;
}

export default function EditCompanyButton(companyId: Company) {
  const router = useRouter();
  const handleEditCompany = () => {
    router.push(`/dashboard/company/${companyId?.companyId}`);
  };
  return (
    <Button className="w-fit font-semibold" variant={'gh_orange'} size={'sm'} onClick={handleEditCompany}>
      Editar Compañía
    </Button>
  );
}
