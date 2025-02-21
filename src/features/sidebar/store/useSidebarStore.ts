'use client';

import { useNavbarStore } from '@/features/navbar/store/navbarStore';
import { create } from 'zustand';

type SidebarStore = {
  isActiveSidebar: boolean;
};

export const useSidebarStore = create<SidebarStore>((set) => {
  useNavbarStore.subscribe((state) => {
    set({
      isActiveSidebar: state.isActiveSidebar,
    });
  });

  return {
    isActiveSidebar: useNavbarStore.getState().isActiveSidebar,
  };
});
