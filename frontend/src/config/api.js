import axios from 'axios';

// API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            // Server responded with error
            const message = error.response.data?.message || 'An error occurred';
            
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // Request made but no response
            return Promise.reject(new Error('Network error. Please check your connection.'));
        } else {
            // Something else happened
            return Promise.reject(error);
        }
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    verify: () => api.get('/auth/verify'),
};

// User APIs
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    getOnlinePlayers: () => api.get('/users/online'),
    getLeaderboard: (limit = 50) => api.get(`/users/leaderboard?limit=${limit}`),
    updateStatus: (status) => api.put('/users/status', { status }),
};

// Game APIs
export const gameAPI = {
    createRoom: () => api.post('/games/create'),
    joinRoom: (roomCode) => api.post('/games/join', { roomCode }),
    placeShips: (roomId, ships) => api.post(`/games/${roomId}/place-ships`, { ships }),
    attack: (roomId, x, y) => api.post(`/games/${roomId}/attack`, { x, y }),
    getHistory: (limit = 20) => api.get(`/games/history?limit=${limit}`),
    getReplay: (gameId) => api.get(`/games/${gameId}/replay`),
};

export default api;

