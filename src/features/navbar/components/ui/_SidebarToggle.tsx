'use client';

import { Button } from '@/components/ui/button';
import cookies from 'js-cookie';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavbarStore } from '../../store/navbarStore';

export function _SidebarToggle() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const savedState = cookies.get('sidebar_state');
    if (savedState) {
      setIsOpen(savedState === 'open');
    }
  }, []);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    cookies.set('sidebar_state', newState ? 'open' : 'closed');
    useNavbarStore.setState({ isActiveSidebar: newState });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="relative hover:bg-accent hover:text-accent-foreground ml-7"
    >
      <Menu className="size-6" />
      <span className="sr-only">{isOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}</span>
    </Button>
  );
}
