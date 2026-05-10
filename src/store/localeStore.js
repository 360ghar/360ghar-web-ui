import { create } from 'zustand';

const useLocaleStore = create((set) => ({
  locale: 'en',
  setLocale: (locale) => set({ locale }),
}));

export default useLocaleStore;
