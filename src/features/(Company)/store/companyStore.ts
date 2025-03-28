'use client';
import { fetchCurrentCompany } from '@/shared/actions/company.actions';
import { create } from 'zustand';

type CompanyStore = {
  currentCompanyId: string | null;
  currentCompanyName: string | null;
  setCurrentCompanyName: (name: string) => void;
  fetchCompany: () => Promise<void>; // Función para obtener la empresa
};

export const useCompanyStore = create<CompanyStore>((set) => ({
  currentCompanyId: null,
  currentCompanyName: null,

  setCurrentCompanyName: (name: string) => set({ currentCompanyName: name }),

  // Función para obtener la empresa actual
  fetchCompany: async () => {
    try {
      const companyData = await fetchCurrentCompany();

      if (!companyData) {
        console.error('Error: No se encontraron datos de la empresa.');
        return;
      }

      set({
        currentCompanyId: companyData?.[0]?.id,
        currentCompanyName: companyData?.[0]?.company_name,
      });
    } catch (error) {
      console.error('Error al obtener la empresa:', error);
    }
  },
}));
