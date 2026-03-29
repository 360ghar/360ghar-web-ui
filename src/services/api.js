import { createAxiosInstance } from './http';

const api = createAxiosInstance({ withAuth: true });
const publicApi = createAxiosInstance({ withAuth: false });

export { api, publicApi };
export default api; 
