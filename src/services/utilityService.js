import { api, publicApi } from './api';

// Utility Services (Amenities, Upload, Support, etc.)
export const utilityService = {
  // Get all available property amenities and features
  getAmenities: async () => {
    const response = await api.get('/amenities/');
    return response.data;
  },

  // Upload files (images, documents) to cloud storage
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // CRITICAL FIX (audit 5.3): public FAQs and public pages must use the
  // unauthenticated `publicApi` instance, otherwise unauthenticated users
  // get 401s (the authenticated `api` instance attaches a Bearer token that
  // may be absent or expired).
  // Get public FAQs
  getPublicFAQs: async (params = {}) => {
    const response = await publicApi.get('/faqs/public', { params });
    return response.data;
  },

  // Get static pages (terms, privacy, etc.)
  getPageByUniqueName: async (uniqueName) => {
    const response = await publicApi.get(`/pages/${uniqueName}/public`);
    return response.data;
  },

  // Report bugs or issues
  reportBug: async (bugData) => {
    const response = await api.post('/bugs/', bugData);
    return response.data;
  },

  // Check for app updates
  checkAppUpdate: async (appData) => {
    const response = await api.post('/versions/check', appData);
    return response.data;
  },
};

