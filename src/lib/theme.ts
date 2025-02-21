import { cookies } from 'next/headers';

export function getTheme() {
  const cookieStore = cookies();
  return cookieStore.get('theme')?.value || 'light';
}
