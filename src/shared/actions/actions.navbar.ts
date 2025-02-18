'use server';

import { headers } from 'next/headers';
import { cleanPath } from '../../features/sidebar/utils/utils.sidebar';

export async function getCurrentPath() {
  const headersList = headers();
  const referer = headersList.get('referer') || '';

  const cleanedPath = cleanPath(referer);

  return cleanedPath || '/';
}
