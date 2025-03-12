'use client';
import { CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSidebarStore } from '../store/useSidebarStore';
import { SidebarProps } from '../types/types';
import { filterNavigationLinks, sortNavigationLinks } from '../utils/sidebar.utils';

export function Sidebar({ pathname, role, userModules }: SidebarProps) {
  const activeLink = pathname.split('/')[2] || 'dashboard';
  const filteredLinks = sortNavigationLinks(filterNavigationLinks(role, userModules));
  const isActiveSidebar = useSidebarStore((state) => state.isActiveSidebar);

  return (
    <div
      className={`relative top-0 left-0 h-full bg-white dark:bg-muted/50 transition-width duration-500 ${isActiveSidebar ? 'w-16' : 'w-60'} sticky top-0 h-screen`}
    >
      <div className={cn('flex items-center p-2 justify-center')}>
        <span className="text-white text-xl flex items-center gap-2 relative overflow-hidden">
          <img src="/logo-azul.png" alt="codeControl logo" className="size-11 relative block" />
          <CardTitle className="relative block text-black">Grupo Horizonte</CardTitle>
        </span>
      </div>
      <ul className="mt-6">
        {filteredLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              'flex items-center p-4 cursor-pointer transition-all duration-500 rounded-s-full lisidebar relative',
              link.name.toLowerCase() === activeLink
                ? 'bg-muted activesidebar before:shadow-custom-white after:shadow-custom-white-inverted'
                : 'hover:bg-muted/80'
            )}
          >
            <div className="flex items-center overflow-hidden">
              <span className="relative">{link.icon}</span>
              <span className="ml-6 text-black relative block">{link.name}</span>
            </div>
          </Link>
        ))}
      </ul>
    </div>
  );
}
