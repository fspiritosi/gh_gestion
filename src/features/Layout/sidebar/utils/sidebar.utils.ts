import { NavigationLink, navigationLinks } from '../constants/navigation';

export function filterNavigationLinks(role: string | null, userModules?: ModulosEnum[] | null) {
  let filteredLinks = [...navigationLinks];

  if (role === 'owner') {
    return filteredLinks;
  }

  if (role === 'Invitado') {
    return filteredLinks.filter(
      (link) => !['empresa', 'operaciones', 'mantenimiento', 'documentación'].includes(link.name.toLowerCase())
    );
  }

  // Si el usuario tiene módulos específicos
  if (userModules?.length) {
    return filteredLinks.filter((link) => userModules.some((mod) => mod.toLowerCase() === link.name.toLowerCase()));
  }

  return filteredLinks;
}

export function sortNavigationLinks(links: NavigationLink[]) {
  return [...links].sort((a, b) => a.position - b.position);
}

export function cleanPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return '';
  }
}
