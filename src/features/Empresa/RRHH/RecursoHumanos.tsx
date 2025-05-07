import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAllContractTypes } from './actions/actions';
import ContractTypesTab from './components/ContractTypeTab';

type ContractType = {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
};

interface RecursoHumanosProps {
  company_id: string;
  contractTypes?: ContractType[];
}

export default async function RecursoHumanos({ company_id, contractTypes = [] }: RecursoHumanosProps) {
  const allContractTypes = await fetchAllContractTypes();

  console.log(allContractTypes, 'allContractTypes');
  return (
    <div className=" ">
      <Tabs defaultValue="contract-types" className="w-full">
        <TabsList className="mb-2 bg-gh_orange">
          <TabsTrigger value="contract-types">Tipos de Contrato</TabsTrigger>
        </TabsList>

        <TabsContent value="contract-types" className="">
          <ContractTypesTab allContractTypes={allContractTypes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
