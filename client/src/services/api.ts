import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (username: string, password: string) => 
    api.post('/auth/login', { username, password }),
  getCurrentUser: () => 
    api.get('/auth/user'),
};

export const caseService = {
  getAllCases: (page = 1, perPage = 10) => 
    api.get(`/cases?page=${page}&per_page=${perPage}`),
  getCaseById: (id: number) => 
    api.get(`/cases/${id}`),
  createCase: (data: any) => 
    api.post('/cases', data),
  updateCase: (id: number, data: any) => 
    api.put(`/cases/${id}`, data),
  deleteCase: (id: number) => 
    api.delete(`/cases/${id}`),
};

export const customerService = {
  getAllCustomers: (page = 1, perPage = 10) => 
    api.get(`/customers?page=${page}&per_page=${perPage}`),
  getCustomerById: (id: number) => 
    api.get(`/customers/${id}`),
  getCustomersByCase: (caseId: number, page = 1, perPage = 10) => 
    api.get(`/customers/case/${caseId}?page=${page}&per_page=${perPage}`),
  createCustomer: (data: any) => 
    api.post('/customers', data),
  updateCustomer: (id: number, data: any) => 
    api.put(`/customers/${id}`, data),
  deleteCustomer: (id: number) => 
    api.delete(`/customers/${id}`),
};

export const investigationService = {
  getAllInvestigations: (page = 1, perPage = 10) => 
    api.get(`/investigations?page=${page}&per_page=${perPage}`),
  getInvestigationById: (id: number) => 
    api.get(`/investigations/${id}`),
  getInvestigationsByCase: (caseId: number, page = 1, perPage = 10) => 
    api.get(`/investigations/case/${caseId}?page=${page}&per_page=${perPage}`),
  createInvestigation: (data: any) => 
    api.post('/investigations', data),
  updateInvestigation: (id: number, data: any) => 
    api.put(`/investigations/${id}`, data),
  deleteInvestigation: (id: number) => 
    api.delete(`/investigations/${id}`),
};

export const targetService = {
  getAllTargets: (page = 1, perPage = 10) => 
    api.get(`/targets?page=${page}&per_page=${perPage}`),
  getTargetById: (id: number) => 
    api.get(`/targets/${id}`),
  getTargetsByInvestigation: (investigationId: number, page = 1, perPage = 10) => 
    api.get(`/targets/investigation/${investigationId}?page=${page}&per_page=${perPage}`),
  createTarget: (data: any) => 
    api.post('/targets', data),
  updateTarget: (id: number, data: any) => 
    api.put(`/targets/${id}`, data),
  deleteTarget: (id: number) => 
    api.delete(`/targets/${id}`),
};

export const searchService = {
  advancedSearch: (data: any) => 
    api.post('/search', data),
};
