import api from './api';

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

  // Get public FAQs
  getPublicFAQs: async (params = {}) => {
    const response = await api.get('/faqs/public', { params });
    return response.data;
  },

  // Get static pages (terms, privacy, etc.)
  getPageByUniqueName: async (uniqueName) => {
    const response = await api.get(`/pages/${uniqueName}/public`);
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

