import api from './axios';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      walletAddress: string;
      name?: string;
      phone?: string;
      address?: string;
    };
  };
}

export const authApi = {
  getNonce: async (walletAddress: string) => {
    const response = await api.post<{ success: boolean; message: string; data: { nonce: string } }>('/api/auth/nonce', {
      walletAddress
    });
    return response.data;
  },

  verifySignature: async (walletAddress: string, signature: string) => {
    const response = await api.post<AuthResponse>('/api/auth/verify', {
      walletAddress,
      signature
    });
    return response.data;
  }
};

// Token management
export const tokenManager = {
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  removeToken: () => {
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
  },

  initializeToken: () => {
    const token = tokenManager.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};

// Initialize token on app start
tokenManager.initializeToken();