import { fetchAllHierarchicalPositions, fetchAllPositions } from '@/features/Empresa/RRHH/actions/actions';

export async function getPositionsData() {
  const [positions, hierarchicalPositions] = await Promise.all([fetchAllPositions(), fetchAllHierarchicalPositions()]);
  return { positions, hierarchicalPositions };
}
