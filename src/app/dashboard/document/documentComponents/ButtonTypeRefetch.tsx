'use client';
import { Button } from '@/components/ui/button';
import { useCountriesStore } from '@/store/countries';
import { useLoggedUserStore } from '@/store/loggedUser';
import cookies from 'js-cookie';
function ButtonTypeRefetch() {
  const fetchDocumentTypes = useCountriesStore((state) => state.documentTypes);
  const actualCompany = useLoggedUserStore((state) => state.actualCompany);
  const company = cookies.get('actualComp');
  return (
    <Button
      onClick={() => {
        document.getElementById('create_new_document')?.click();
        fetchDocumentTypes(actualCompany?.id || company || '');
      }}
    >
      Crear documento
    </Button>
  );
}

export default ButtonTypeRefetch;
