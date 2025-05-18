import { cookies } from 'next/headers';
import PositionsClient from './positionsClient';
import { getPositionsData } from './positionsData';

export default async function PositionsTab() {
  const { positions, hierarchicalPositions, aptitudes } = await getPositionsData();
  const cookiesStore = cookies();
  const savedVisibility = cookiesStore.get('positions-table')?.value;
  return (
    <PositionsClient
      positions={positions as any}
      hierarchicalPositions={hierarchicalPositions}
      aptitudes={aptitudes}
      savedVisibility={savedVisibility ? JSON.parse(savedVisibility) : {}}
    />
  );
}
