import { create } from 'zustand';

const useUIStore = create((set) => ({
  // Mobile menu
  toggleMobileMenu: false,
  handleMobileMenuClick: () =>
    set((state) => {
      const nextMobileMenu = !state.toggleMobileMenu;
      return {
        toggleMobileMenu: nextMobileMenu,
        offCanvas: nextMobileMenu ? false : state.offCanvas,
        hideScroll: nextMobileMenu || state.offCanvas,
      };
    }),
  handleMobileMenuClose: () =>
    set((state) => ({
      toggleMobileMenu: false,
      hideScroll: state.offCanvas,
    })),

  // Off-canvas sidebar
  offCanvas: false,
  handleOffCanvas: () =>
    set((state) => {
      const nextOffCanvas = !state.offCanvas;
      return {
        offCanvas: nextOffCanvas,
        toggleMobileMenu: nextOffCanvas ? false : state.toggleMobileMenu,
        hideScroll: nextOffCanvas || state.toggleMobileMenu,
      };
    }),
  handleOffCanvasClose: () =>
    set((state) => ({
      offCanvas: false,
      hideScroll: state.toggleMobileMenu,
    })),

  // Derived UI flag kept for compatibility with existing selectors/tests.
  hideScroll: false,
}));

export { useUIStore };
