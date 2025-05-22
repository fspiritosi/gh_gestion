import { createFilterOptions } from '@/features/Employees/Empleados/components/utils/utils';
import { BaseDataTable } from '@/shared/components/data-table/base/data-table';
import { fetchAllRepairSolicitudes } from '../actions/actions';
import { repairSolicitudesColums } from './components/columns';
import { mechanicColums } from './components/mechanicColumns';

export default async function RepairSolicitudes({
  mechanic,
  default_equipment_id,
}: {
  mechanic?: boolean;
  default_equipment_id?: string;
}) {
  const repair_solicitudes = await fetchAllRepairSolicitudes();

  // console.log(repair_solicitudes);

  const Allrepairs = default_equipment_id
    ? repair_solicitudes.filter((repair) => repair.equipment_id === default_equipment_id)
    : repair_solicitudes;

  const repairsFormatted = Allrepairs?.map((repair) => {
    return {
      id: repair.id,
      title: repair.types_of_repairs?.name,
      state: repair.state,
      label: '',
      priority: repair.types_of_repairs?.criticity,
      created_at: repair.created_at,
      equipment: `${repair.vehicles?.domain} - ${repair.vehicles?.intern_number}`,
      description: repair.user_description,
      user_description: repair.user_description,
      year: repair.vehicles?.year,
      brand: repair.vehicles?.brand_vehicles?.name,
      model: repair.vehicles?.model_vehicles?.name,
      domain: repair.vehicles?.domain ?? repair.vehicles?.serie,
      engine: repair.vehicles?.engine,
      serie: repair.vehicles?.serie,
      status: repair.vehicles?.status,
      chassis: repair.vehicles?.chassis,
      picture: repair.vehicles?.picture,
      type_of_equipment: repair.vehicles?.type.name,
      solicitud_status: repair.state,
      type_of_maintenance: repair.types_of_repairs?.type_of_maintenance,
      user_images: repair.user_images,
      mechanic_images: repair.mechanic_images,
      repairlogs: repair.repairlogs,
      mechanic_description: repair.mechanic_description,
      vehicle_id: repair.equipment_id,
      vehicle_condition: repair.vehicles?.condition,
      intern_number: repair.vehicles?.intern_number,
      kilometer: repair.kilometer,
    };
  });

  const names = createFilterOptions(
    repairsFormatted,
    (repair) => repair.title
    // FileText // Icono para documentos
  );

  const statis = createFilterOptions(
    repairsFormatted,
    (repair) => repair.state
    // FileText // Icono para documentos
  );
  const priority = createFilterOptions(
    repairsFormatted,
    (repair) => repair.priority
    // FileText // Icono para documentos
  );
  const Criticidad = createFilterOptions(
    repairsFormatted,
    (repair) => repair.priority
    // FileText // Icono para documentos
  );

  const internNumber = createFilterOptions(
    repairsFormatted,
    (repair) => repair.intern_number
    // FileText // Icono para documentos
  );

  const domain = createFilterOptions(
    repairsFormatted,
    (repair) => repair.domain
    // FileText // Icono para documentos
  );
  // console.log(repairsFormatted, 'repairsFormatted');

  return (
    <>
      {/* <DataTable data={repairsFormatted || []} columns={mechanic ? mechanicColums : repairSolicitudesColums} /> */}
      <BaseDataTable
        data={(repairsFormatted as any) || []}
        columns={mechanic ? mechanicColums : repairSolicitudesColums}
        savedVisibility={{}}
        toolbarOptions={{
          filterableColumns: [
            {
              columnId: 'Titulo',
              title: 'Titulo',
              options: names,
            },
            {
              columnId: 'Estado',
              title: 'Estado',
              options: statis,
            },
            {
              columnId: 'Criticidad',
              title: 'Criticidad',
              options: priority,
            },
            {
              columnId: 'Numero interno',
              title: 'Numero interno',
              options: internNumber,
            },
            {
              columnId: 'Dominio',
              title: 'Dominio',
              options: domain,
            },
          ],
        }}
      />
    </>
  );
}
