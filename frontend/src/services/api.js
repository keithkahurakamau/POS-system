import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const ProductAPI = {
    getAll: () => apiClient.get('/api/products/'),
    create: (formData) => apiClient.post('/api/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const SaleAPI = {
    create: (saleData) => apiClient.post('/api/sales/', saleData),
    getById: (saleId) => apiClient.get(`/api/sales/${saleId}`)
};

export const PaymentAPI = {
    initiateStkPush: (payload) => apiClient.post('/api/payments/mpesa/stkpush', payload)
};

export const AnalyticsAPI = {
    getDashboard: () => apiClient.get('/api/analytics/dashboard')
};