'use client';

import { cn } from '@/lib/utils';
import { useLoggedUserStore } from '@/store/loggedUser';
import {
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideBar({ Allinks, role }: { Allinks: any; role: string }) {
  const isAuditor = role === 'Auditor';
  if (isAuditor) {
    return null;
  }
  const isActive = useLoggedUserStore((state) => state.active_sidebar);
  const pathName = usePathname();

  const sizeIcons = 22;

  const Allinks33 = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard size={sizeIcons} />,
      regex: /^\/dashboard(\/|$)/,
    },
    {
      name: 'Empresa',
      href: '/dashboard/company/actualCompany',
      icon: <Building2 size={sizeIcons} />,
      regex: /^\/dashboard\/company\/actualCompany(\/|$)/,
    },
    {
      name: 'Empleados',
      href: '/dashboard/employee',
      icon: <Users size={sizeIcons} />,
      regex: /^\/dashboard\/employee(\/|$)/,
    },
    {
      name: 'Equipos',
      href: '/dashboard/equipment',
      icon: <Truck size={sizeIcons} />,
      regex: /^\/dashboard\/equipment(\/|$)/,
    },
    {
      name: 'Documentación',
      href: '/dashboard/document',
      icon: <FileText size={sizeIcons} />,
      regex: /^\/dashboard\/document(\/|$)/,
    },
    {
      name: 'Operaciones',
      href: '/dashboard/operations',
      icon: <Calendar size={sizeIcons} />,
      regex: /^\/dashboard\/operations(\/|$)/,
    },
    {
      name: 'Mantenimiento',
      href: '/dashboard/maintenance',
      icon: <Wrench size={sizeIcons} />,
      regex: /^\/dashboard\/maintenance(\/|$)/,
    },
    {
      name: 'Formularios',
      href: '/dashboard/forms',
      icon: <ClipboardList size={sizeIcons} />,
      regex: /^\/dashboard\/forms(\/|$)/,
    },
    {
      name: 'Ayuda',
      href: '/dashboard/help',
      icon: <HelpCircle size={sizeIcons} />,
      regex: /^\/dashboard\/help(\/|$)/,
    },
  ];

  const activeLink = Allinks33.reduce(
    (bestMatch: any, link: any) => {
      const match = pathName.match(link.regex);
      const matchLength = match ? match[0].length : 0;
      return matchLength > bestMatch.matchLength ? { link, matchLength } : bestMatch;
    },
    { link: null, matchLength: 0 }
  ).link.name;

  return (
    <div
      key={role}
      className={`relative top-0 left-0 h-full bg-gh dark:bg-slate-950 dark:text-white transition-width duration-500 ${isActive ? 'w-16' : 'w-60'} sticky top-0 h-screen`}
    >
      <div className={cn('flex items-center p-2 justify-center')}>
        <span className="text-white text-xl flex items-center gap-2 relative overflow-hidden">
          <img src="/gh_logo.png" alt="codeControl logo" className=" relative block" />
        </span>
      </div>
      <ul className="mt-4">
        {Allinks.map((link: any) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              'flex items-center p-4 cursor-pointer transition-all duration-500 rounded-s-full lisidebar relative',
              link.name === activeLink
                ? 'bg-gh_contrast dark:bg-slate-900 activesidebar before:shadow-custom-gh_contrast after:shadow-custom-gh_contrast-inverted'
                : 'hover:bg-gh_contrast/80',
              isActive ? 'ml-0' : 'ml-4'
            )}
          >
            <div className="flex items-center overflow-hidden">
              <span className="relative">{Allinks33.find((link2) => link2.name === link.name)?.icon}</span>
              <span className="ml-6 text-black dark:text-white relative block">{link.name}</span>
            </div>
          </Link>
        ))}
      </ul>
    </div>
  );
}
