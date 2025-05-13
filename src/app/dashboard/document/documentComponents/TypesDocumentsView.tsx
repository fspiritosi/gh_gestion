'use client';
import {
  fetchAllDocumentTypes,
  fetchAllEmployeesWithRelations,
  fetchAllEquipmentWithRelations,
} from '@/app/server/GET/actions';
import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import DocumentsTable from './DocumentsTable'; // Asumo que este componente existe
import FilterHeader from './FilterComponent';
import TypesDocumentAction, { setEmployeeDataOptions, setVehicleDataOptions } from './TypesDocumentAction';

function TypesDocumentsView({
  personas,
  equipos,
  empresa,
  tabValue,
  subtab,
  employeeMockValues,
  vehicleMockValues,
  employees,
  vehicles,
  role,
  document_types,
}: {
  personas?: boolean;
  equipos?: boolean;
  empresa?: boolean;
  tabValue?: string;
  subtab?: string;
  employeeMockValues: Awaited<ReturnType<typeof setEmployeeDataOptions>>;
  vehicleMockValues: Awaited<ReturnType<typeof setVehicleDataOptions>>;
  employees: Awaited<ReturnType<typeof fetchAllEmployeesWithRelations>>;
  vehicles: Awaited<ReturnType<typeof fetchAllEquipmentWithRelations>>;
  role?: string;
  document_types?: Awaited<ReturnType<typeof fetchAllDocumentTypes>>;
}) {
  // const document_types = useCountriesStore((state) => state.companyDocumentTypes);

  const doc_personas = document_types?.filter((doc) => doc.applies === 'Persona').filter((e) => e.is_active);
  const doc_equipos = document_types?.filter((doc) => doc.applies === 'Equipos').filter((e) => e.is_active);
  const doc_empresa = document_types?.filter((doc) => doc.applies === 'Empresa').filter((e) => e.is_active);

  const [filters, setFilters] = useState({
    personas: { name: '', multiresource: '', special: '', monthly: '', expired: '', mandatory: '', private: '' },
    equipos: { name: '', multiresource: '', special: '', monthly: '', expired: '', mandatory: '', private: '' },
    empresa: { name: '', multiresource: '', special: '', monthly: '', expired: '', mandatory: '', private: '' },
  });

  const handleFilterChange = (type: 'personas' | 'equipos' | 'empresa', filterName: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [type]: { ...prevFilters[type], [filterName]: value },
    }));
  };

  const applyFilters = (
    docs: typeof doc_personas | typeof doc_equipos | typeof doc_empresa,
    type: 'personas' | 'equipos' | 'empresa'
  ) => {
    const filter = filters[type];
    return docs?.filter((doc) => {
      const matchesName = doc.name.toLowerCase().includes(filter.name.toLowerCase());
      const matchesMultiresource =
        filter.multiresource === '' || (filter.multiresource === 'Si' ? doc.multiresource : !doc.multiresource);
      const matchesSpecial = filter.special === '' || (filter.special === 'Si' ? doc.special : !doc.special);
      const matchesMonthly =
        filter.monthly === '' || (filter.monthly === 'Si' ? doc.is_it_montlhy : !doc.is_it_montlhy);
      const matchesExpired = filter.expired === '' || (filter.expired === 'Si' ? doc.explired : !doc.explired);
      const matchesMandatory = filter.mandatory === '' || (filter.mandatory === 'Si' ? doc.mandatory : !doc.mandatory);
      const matchesPrivate = filter.private === '' || (filter.private === 'Si' ? doc.private : !doc.private);

      return (
        matchesName &&
        matchesMultiresource &&
        matchesSpecial &&
        matchesMonthly &&
        matchesExpired &&
        matchesMandatory &&
        matchesPrivate
      );
    });
  };

  const filteredDocPersonas = applyFilters(doc_personas, 'personas');
  const filteredDocEquipos = applyFilters(doc_equipos, 'equipos');
  const filteredDocEmpresa = applyFilters(doc_empresa, 'empresa');

  const convertToOptions = (array: any) =>
    Array.from(new Set(array?.map((val: any) => (val === true ? 'Si' : 'No')))).filter((val: any) => val !== undefined);

  const docOptions = {
    multiresource: convertToOptions(document_types?.map((doc: any) => doc.multiresource)),
    special: convertToOptions(document_types?.map((doc: any) => doc.special)),
    monthly: convertToOptions(document_types?.map((doc) => doc.is_it_montlhy)),
    expired: convertToOptions(document_types?.map((doc) => doc.explired)),
    mandatory: convertToOptions(document_types?.map((doc) => doc.mandatory)),
    private: convertToOptions(document_types?.map((doc) => doc.private)),
  };

  const optionValue =
    personas && equipos && empresa ? 'Personas' : personas ? 'Personas' : equipos ? 'Equipos' : 'Empresa';

  // const viewData = {
  //   defaultValue: subtab || (personas ? 'Personas' : equipos ? 'Equipos' : 'Empresa'),
  //   path: '/dashboard/document/types',
  //   tabsValues: [
  //     ...(personas
  //       ? [
  //           {
  //             value: 'Personas',
  //             name: `Personas (${filteredDocPersonas?.length || 0})`,
  //             tab: tabValue,
  //             restricted: [''],
  //             content: {
  //               title: 'Documentos de Personas',
  //               description: '',
  //               buttonActioRestricted: [''],
  //               buttonAction: '',
  //               component: (
  //                 <DocumentsTable data={filteredDocPersonas} filters={filters.personas} employeeMockValues={employeeMockValues} vehicleMockValues={vehicleMockValues} employees={employees} vehicles={vehicles}>
  //                   <FilterHeader
  //                     filters={filters.personas}
  //                     docOptions={docOptions}
  //                     onFilterChange={(name, value) => handleFilterChange('personas', name, value)}
  //                   />
  //                 </DocumentsTable>
  //               ),
  //             },
  //           },
  //         ]
  //       : []),
  //     ...(equipos
  //       ? [
  //           {
  //             value: 'Equipos',
  //             name: `Equipos (${filteredDocEquipos?.length || 0})`,
  //             tab: tabValue,
  //             restricted: [''],
  //             content: {
  //               title: 'Documentos de Equipos',
  //               description: '',
  //               buttonActioRestricted: [''],
  //               buttonAction: '',
  //               component: (
  //                 <DocumentsTable data={filteredDocEquipos} filters={filters.equipos} employeeMockValues={employeeMockValues} vehicleMockValues={vehicleMockValues} employees={employees} vehicles={vehicles}>
  //                   <FilterHeader
  //                     filters={filters.equipos}
  //                     docOptions={docOptions}
  //                     onFilterChange={(name, value) => handleFilterChange('equipos', name, value)}
  //                   />
  //                 </DocumentsTable>
  //               ),
  //             },
  //           },
  //         ]
  //       : []),
  //     ...(empresa
  //       ? [
  //           {
  //             value: 'Empresa',
  //             name: `Empresa (${filteredDocEmpresa?.length || 0})`,
  //             tab: tabValue,
  //             restricted: [''],
  //             content: {
  //               title: 'Documentos de Empresa',
  //               description: '',
  //               buttonActioRestricted: [''],
  //               buttonAction: '',
  //               component: (
  //                 <DocumentsTable data={filteredDocEmpresa} filters={filters.empresa} employeeMockValues={employeeMockValues} vehicleMockValues={vehicleMockValues} employees={employees} vehicles={vehicles}>
  //                   <FilterHeader
  //                     filters={filters.empresa}
  //                     docOptions={docOptions}
  //                     onFilterChange={(name, value) => handleFilterChange('empresa', name, value)}
  //                   />
  //                 </DocumentsTable>
  //               ),
  //             },
  //           },
  //         ]
  //       : []),
  //   ],
  // };

  return (
    <CardContent className="px-0 pt-1">
      <Tabs defaultValue={optionValue} className="w-full">
        <div className="flex flex-col w-fit gap-2">
          <TabsList className="w-fit">
            {personas && <TabsTrigger value="Personas">Personas ({filteredDocPersonas?.length || 0})</TabsTrigger>}
            {equipos && <TabsTrigger value="Equipos">Equipos ({filteredDocEquipos?.length || 0})</TabsTrigger>}
            {empresa && <TabsTrigger value="Empresa">Empresa ({filteredDocEmpresa?.length || 0})</TabsTrigger>}
          </TabsList>
          <div>
            <TypesDocumentAction
              EmployeesOptionsData={employeeMockValues}
              VehicleOptionsData={vehicleMockValues}
              empleadosCargados={employees}
              equiposCargados={vehicles}
              role={role || ''}
              optionChildrenProp="Persona"
            />
          </div>
        </div>
        {personas && (
          <TabsContent value="Personas">
            <DocumentsTable
              data={filteredDocPersonas || []}
              filters={filters.personas}
              employeeMockValues={employeeMockValues}
              vehicleMockValues={vehicleMockValues}
              employees={employees}
              vehicles={vehicles}
            >
              <FilterHeader
                filters={filters.personas}
                docOptions={docOptions as any}
                onFilterChange={(name, value) => handleFilterChange('personas', name, value)}
              />
            </DocumentsTable>
          </TabsContent>
        )}
        {equipos && (
          <TabsContent value="Equipos">
            <DocumentsTable
              data={filteredDocEquipos || []}
              filters={filters.equipos}
              employeeMockValues={employeeMockValues}
              vehicleMockValues={vehicleMockValues}
              employees={employees}
              vehicles={vehicles}
            >
              <FilterHeader
                filters={filters.equipos}
                docOptions={docOptions as any}
                onFilterChange={(name, value) => handleFilterChange('equipos', name, value)}
              />
            </DocumentsTable>
          </TabsContent>
        )}
        {empresa && (
          <TabsContent value="Empresa">
            <DocumentsTable
              data={filteredDocEmpresa || []}
              filters={filters.empresa}
              employeeMockValues={employeeMockValues}
              vehicleMockValues={vehicleMockValues}
              employees={employees}
              vehicles={vehicles}
            >
              <FilterHeader
                filters={filters.empresa}
                docOptions={docOptions as any}
                onFilterChange={(name, value) => handleFilterChange('empresa', name, value)}
              />
            </DocumentsTable>
          </TabsContent>
        )}
      </Tabs>
    </CardContent>
  );
}

export default TypesDocumentsView;
