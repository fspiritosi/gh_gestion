'use server';

import { headers } from 'next/headers';
import { cleanPath } from '../../features/Layout/sidebar/utils/utils.sidebar';

export async function getCurrentPath() {
  const headersList = headers();
  const referer = headersList.get('referer') || '';

  // Añadir logs de depuración
  console.log('Referer original:', referer);

  const cleanedPath = cleanPath(referer);

  // Añadir logs de depuración
  console.log('Ruta limpia:', cleanedPath);

  // Forzar dashboard si estamos en la ruta principal
  if (cleanedPath === '/' || cleanedPath === '' || cleanedPath === '/dashboard') {
    console.log('Detectada ruta principal, devolviendo /dashboard');
    return '/dashboard';
  }

  return cleanedPath || '/';
}
