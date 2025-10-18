import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    TIMEOUT: 80000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accesstoken = localStorage.getItem('token');
        if (accesstoken) {
            config.headers.Authorization = `Bearer ${accesstoken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 500) {
                console.error('Unauthorized access - perhaps redirect to login?');
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('A timeout happened on url ');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;