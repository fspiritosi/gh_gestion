'use client';

import cookies from 'js-cookie';
import { create } from 'zustand';

type NavbarStore = {
  toggleSidebar: () => void;
  isActiveSidebar: boolean;
};

export const useNavbarStore = create<NavbarStore>(() => ({
  isActiveSidebar: false,
  toggleSidebar: () => {
    const currentState = cookies.get('sidebar_state');
    const newState = currentState === 'true' ? 'false' : 'true';
    cookies.set('sidebar_state', newState);
    useNavbarStore.setState({ isActiveSidebar: newState === 'true' });
  },
}));
