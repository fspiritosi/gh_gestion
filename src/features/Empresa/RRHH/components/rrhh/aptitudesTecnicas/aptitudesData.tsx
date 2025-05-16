import { getAptitudesData as fetchAptitudesData } from '../actions/aptitudesTecnicas';

export type { AptitudTecnica } from '../actions/aptitudesTecnicas';

/**
 * Obtiene tanto las aptitudes técnicas como los puestos en una sola llamada
 * Esta función es un wrapper alrededor de la función del servidor
 */
export async function AptitudesData() {
  try {
    return await fetchAptitudesData();
  } catch (error) {
    console.error('Error al obtener los datos de aptitudes y puestos:', error);
    return { aptitudes: [], positions: [] };
  }
}
