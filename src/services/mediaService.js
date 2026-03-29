import api from './api';

export const mediaService = {
  // Upload a single media file (multipart/form-data)
  uploadMedia: async (formData) => {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // List media files (supports query params like property_id, media_type, etc.)
  listMedia: async (params = {}) => {
    const response = await api.get('/upload/media', { params });
    return response.data;
  },

  // Get a single media file by ID
  getMedia: async (mediaId) => {
    const response = await api.get(`/upload/media/${mediaId}`);
    return response.data;
  },

  // Update media metadata
  updateMedia: async (id, mediaData) => {
    const response = await api.patch(`/upload/media/${id}`, mediaData);
    return response.data;
  },

  // Delete a media file
  deleteMedia: async (id) => {
    const response = await api.delete(`/upload/media/${id}`);
    return response.data;
  },
};

