'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import cookies from 'js-cookie';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type ThemeOption = 'light' | 'dark' | 'system';

type MenuItem = {
  label: string;
  value: ThemeOption;
  icon: LucideIcon;
};

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const savedTheme = cookies.get('theme');
    if (savedTheme) {
      setTheme(savedTheme as ThemeOption);
    }
  }, [setTheme]);

  const getCurrentIcon = () => {
    if (!mounted) {
      const savedTheme = cookies.get('theme');
      if (savedTheme === 'dark') return <Moon className="h-[1.2rem] w-[1.2rem]" />;
      if (savedTheme === 'light') return <Sun className="h-[1.2rem] w-[1.2rem]" />;
      return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    }

    if (theme === 'dark') return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    if (theme === 'light') return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
  };

  const menuItems: MenuItem[] = [
    { label: 'Claro', value: 'light', icon: Sun },
    { label: 'Oscuro', value: 'dark', icon: Moon },
    { label: 'Sistema', value: 'system', icon: Monitor },
  ];

  const handleThemeChange = (value: ThemeOption) => {
    setTheme(value);
    cookies.set('theme', value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative !border-0 hover:bg-accent hover:text-accent-foreground">
          <span className="animate-in fade-in zoom-in duration-300">
            <Monitor className="h-[1.2rem] w-[1.2rem]" />
          </span>
          <span className="sr-only">Seleccionar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="font-bold">Tema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map(({ label, value, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleThemeChange(value)}
            className={cn('flex items-center gap-2 cursor-pointer', theme === value && 'bg-accent')}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {theme === value && <span className="flex h-2 w-2 rounded-full bg-primary ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
