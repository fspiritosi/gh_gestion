// import { useParams } from 'next/navigation';
// import { supabaseBrowser } from '@/lib/supabase/browser';
// import {ItemCompany} from '@/app/dashboard/company/companyComponents/itemCompany';
// import BackButton from '@/components/BackButton';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
import ServiceComponent from '@/features/Empresa/Clientes/components/Services/ServiceComponent';
function ContractDetail({ id }: { id: string }) {
  // const [contract, setContract] = useState<any>(null);

  // const supabase = supabaseBrowser();

  // useEffect(() => {
  //   if (!id) return;

  //   const fetchContract = async () => {
  //     const { data, error } = await supabase
  //       .from('customer_services')
  //       .select('*, customer_id(name), area_id(nombre), sector_id(name)')
  //       .eq('id', id)
  //       .single();

  //     if (error) {
  //       console.error('Error fetching contract:', error);
  //     } else {
  //       console.log('Fetched contract:', data);
  //       setContract(data);
  //     }
  //   };

  //   fetchContract();
  // }, [id, supabase]);
  return (
    <ServiceComponent id={id} />
    // <ServicesForm editingService={contract as any} company_id={contract?.company_id as any} areas={contract?.areas as any} sectors={contract?.sectors as any} customers={contract?.customers as any} />
    // <div className="flex flex-col gap-4 p-4">
    //     {/* <Card className="p-4"> */}
    //   <div className="flex justify-end">
    //     <Link href="/dashboard/company/actualCompany?tab=comerce&subtab=service">
    //     <Button>
    //         Volver
    //     </Button>
    //     </Link>
    //   </div>
    //   <ItemCompany name="Título del Contrato" info={contract?.service_name} />
    //   <ItemCompany name="Cliente" info={contract?.customer_id?.name} />
    //   <ItemCompany name="Area" info={contract?.area_id?.nombre} />
    //   <ItemCompany name="Sector" info={contract?.sector_id?.name} />
    //   <ItemCompany name="Inicio del contrato" info={contract?.service_start} />
    //   <ItemCompany name="Fin del contrato" info={contract?.service_validity} />
    //     {/* </Card> */}
    // </div>
  );
}

export default ContractDetail;
