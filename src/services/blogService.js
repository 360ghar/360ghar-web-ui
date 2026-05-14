import { api, publicApi } from './api';

// Blog and Content Service
export const blogService = {
  // Get blog posts with filtering and pagination
  getPosts: async (params = {}) => {
    const response = await publicApi.get('/blog/posts', { params });
    return response.data;
  },

  // Get specific blog post by ID or slug
  getPostByIdentifier: async (identifier) => {
    const response = await publicApi.get(`/blog/posts/${identifier}`);
    return response.data;
  },

  // Get all blog categories
  getCategories: async (params = {}) => {
    const response = await publicApi.get('/blog/categories', { params });
    return response.data;
  },

  // Get specific category by ID or slug
  getCategoryByIdentifier: async (identifier) => {
    const response = await publicApi.get(`/blog/categories/${identifier}`);
    return response.data;
  },

  // Get all blog tags
  getTags: async (params = {}) => {
    const response = await publicApi.get('/blog/tags', { params });
    return response.data;
  },

  // Get specific tag by ID or slug
  getTagByIdentifier: async (identifier) => {
    const response = await publicApi.get(`/blog/tags/${identifier}`);
    return response.data;
  },

  // Admin: create a new blog post (requires auth)
  createPost: async (data) => {
    const response = await api.post('/blog/posts', data);
    return response.data;
  },

  // Admin: update a blog post by ID or slug (requires auth)
  updatePost: async (identifier, data) => {
    const response = await api.put(`/blog/posts/${identifier}`, data);
    return response.data;
  },

  // Admin: delete a blog post by ID or slug (requires auth)
  deletePost: async (identifier) => {
    const response = await api.delete(`/blog/posts/${identifier}`);
    return response.data;
  },
};

