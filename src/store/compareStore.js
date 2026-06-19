import { create } from 'zustand';

// AUDIT FIX (improvement 2.3): minimal property comparison store.
// Users can select 2-4 properties and open a side-by-side comparison tray.
const MAX_COMPARE = 4;

const useCompareStore = create((set, get) => ({
  compareList: [],
  isCompareOpen: false,

  toggleCompare: (property) => {
    const list = get().compareList;
    const exists = list.some((p) => p.id === property.id);
    if (exists) {
      set({ compareList: list.filter((p) => p.id !== property.id) });
      return;
    }
    if (list.length >= MAX_COMPARE) {
      return false;
    }
    set({ compareList: [...list, property] });
    return true;
  },

  removeCompare: (id) => {
    set((state) => ({
      compareList: state.compareList.filter((p) => p.id !== id),
    }));
  },

  clearCompare: () => set({ compareList: [], isCompareOpen: false }),

  openCompare: () => set({ isCompareOpen: true }),
  closeCompare: () => set({ isCompareOpen: false }),
}));

export { useCompareStore };
