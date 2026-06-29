import { create } from 'zustand';
import { dataHubService } from '../services/dataHubService';

export const useDataHubStore = create((set, get) => ({
  // State
  auctionAlerts: [],
  circleRateSectors: [],
  isLoadingAlerts: false,
  isLoadingSectors: false,
  error: null,

  // Actions
  fetchAuctionAlerts: async () => {
    if (get().isLoadingAlerts) return;
    set({ isLoadingAlerts: true });
    try {
      const alerts = await dataHubService.getMyAuctionAlerts();
      const alertItems = Array.isArray(alerts) ? alerts : (Array.isArray(alerts?.items) ? alerts.items : []);
      set({ auctionAlerts: alertItems });
    } catch {
      set({ auctionAlerts: [] });
    } finally {
      set({ isLoadingAlerts: false });
    }
  },

  addAlert: async (alertData) => {
    try {
      const alert = await dataHubService.createAuctionAlert(alertData);
      set((state) => ({ auctionAlerts: [alert, ...state.auctionAlerts] }));
      return alert;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateAlert: async (id, data) => {
    try {
      const updated = await dataHubService.updateAuctionAlert(id, data);
      set((state) => ({
        auctionAlerts: state.auctionAlerts.map((a) => (a.id === id ? updated : a)),
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteAlert: async (id) => {
    try {
      await dataHubService.deleteAuctionAlert(id);
      set((state) => ({
        auctionAlerts: state.auctionAlerts.filter((a) => a.id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchCircleRateSectors: async () => {
    if (get().circleRateSectors.length > 0 || get().isLoadingSectors) return;
    set({ isLoadingSectors: true });
    try {
      const sectors = await dataHubService.getCircleRateSectors();
      const sectorItems = Array.isArray(sectors) ? sectors : (Array.isArray(sectors?.items) ? sectors.items : []);
      set({ circleRateSectors: sectorItems });
    } catch {
      set({ circleRateSectors: [] });
    } finally {
      set({ isLoadingSectors: false });
    }
  },
}));

