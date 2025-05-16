import {
  fetchAllAptitudesTecnicas,
  fetchAllHierarchicalPositions,
  fetchAllPositions,
} from '@/features/Empresa/RRHH/actions/actions';

export async function getPositionsData() {
  const [positions, hierarchicalPositions, aptitudes] = await Promise.all([
    fetchAllPositions(),
    fetchAllHierarchicalPositions(),
    fetchAllAptitudesTecnicas(),
  ]);
  return { positions, hierarchicalPositions, aptitudes };
}
