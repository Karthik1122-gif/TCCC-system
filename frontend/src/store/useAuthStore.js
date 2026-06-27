import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('userInfo')) || null,
  isAuthenticated: !!localStorage.getItem('userInfo'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({
        error: error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
        isLoading: false,
      });
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, userData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({
        error: error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
        isLoading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem('userInfo');
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
