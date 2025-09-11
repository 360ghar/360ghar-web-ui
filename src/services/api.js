import { createAxiosInstance } from './http';

// Create axios instance with base URL and auth
const api = createAxiosInstance({ withAuth: true });

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors only for authenticated endpoints
    if (error.response && error.response.status === 401) {
      // Check if this is a public endpoint (property viewing)
      const publicEndpoints = ['/properties/?', '/properties/', '/properties/recommendations/'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        error.config?.url?.includes(endpoint)
      );
      
      // Only redirect to login if it's not a public endpoint and user was actually logged in
      if (!isPublicEndpoint && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 
