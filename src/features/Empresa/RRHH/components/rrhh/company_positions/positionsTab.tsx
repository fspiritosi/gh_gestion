import PositionsClient from './positionsClient';
import { getPositionsData } from './positionsData';

export default async function PositionsTab() {
  const { positions, hierarchicalPositions, aptitudes } = await getPositionsData();
  return <PositionsClient positions={positions} hierarchicalPositions={hierarchicalPositions} aptitudes={aptitudes} />;
}
