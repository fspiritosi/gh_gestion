import PositionsClient from './positionsClient';
import { getPositionsData } from './positionsData';

export default async function PositionsTab() {
  const { positions, hierarchicalPositions } = await getPositionsData();

  return <PositionsClient positions={positions} hierarchicalPositions={hierarchicalPositions} />;
}
