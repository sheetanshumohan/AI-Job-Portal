import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Set auth state manually
      setAuth: (user, token) => set({ user, token, isAuthenticated: !!user }),

      // Check Authentication (on mount)
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/auth/me');
          set({ 
            user: response.data.data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return { success: true };
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false, token: null });
          return { success: false };
        }
      },

      // Login action just for checking purpose for checking
      login: async (email, password, role, rememberMe) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password, role, rememberMe });
          const { accessToken, data, needsVerification } = response.data;
          
          // Even if needsVerification is true, we store the token so follow-up calls (like verify-email) work.
          set({ 
            user: data.user, 
            token: accessToken, 
            isAuthenticated: !needsVerification, // Only authenticated if verified
            isLoading: false 
          });

          return { success: true, needsVerification, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Login failed' 
          };
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', userData);
          const { accessToken, data } = response.data;
          // After register, user needs verification, so isAuthenticated is false
          set({ 
            user: data.user, 
            token: accessToken, 
            isAuthenticated: false, 
            isLoading: false 
          });
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Registration failed' 
          };
        }
      },

      // Google Login action
      googleLogin: async (idToken, role) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/google', { idToken, role });
          const { accessToken, data } = response.data;
          set({ user: data.user, token: accessToken, isAuthenticated: true, isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Google Login failed' 
          };
        }
      },

      // Verify Email action
      verifyEmail: async (otp) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/verify-email', { otp });
          set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Verification failed' 
          };
        }
      },

      // Forgot Password action
      forgotPassword: async (email, role) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/forgot-password', { email, role });
          set({ isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Failed to send OTP' 
          };
        }
      },

      // Reset Password action
      resetPassword: async (email, otp, newPassword) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/reset-password', { email, otp, newPassword });
          set({ isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Reset failed' 
          };
        }
      },

      // Logout action
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        toast.success('Logged out successfully');
        api.post('/auth/logout').catch(console.error); // Optional API logout
      },
      // Update user profile action
      updateUser: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/student/profile', profileData);
          set({ 
            user: response.data.data, 
            isLoading: false 
          });
          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update profile';
          set({ isLoading: false });
          return { success: false, message };
        }
      },
      // Regenerate AI Summary action
      regenerateSummary: async () => {
        set({ isLoading: true });
        try {
          const response = await api.post('/student/regenerate-summary');
          const newBio = response.data.data;
          set((state) => ({
            user: { ...state.user, bio: newBio },
            isLoading: false
          }));
          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to regenerate summary';
          set({ isLoading: false });
          return { success: false, message };
        }
      },
      // Update Avatar action
      updateAvatar: async (file) => {
        set({ isLoading: true });
        try {
          const formData = new FormData();
          formData.append('avatar', file);

          const response = await api.post('/student/update-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          const newAvatarUrl = response.data.data;
          set((state) => ({
            user: { ...state.user, avatar: newAvatarUrl },
            isLoading: false
          }));
          return { success: true, message: response.data.message, data: newAvatarUrl };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update avatar';
          set({ isLoading: false });
          return { success: false, message };
        }
      },
      // Update Resume action
      updateResume: async (file) => {
        set({ isLoading: true });
        try {
          const formData = new FormData();
          formData.append('resume', file);

          const response = await api.post('/student/update-resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          const newResumeUrl = response.data.data;
          set((state) => ({
            user: { ...state.user, resumeUrl: newResumeUrl },
            isLoading: false
          }));
          return { success: true, message: response.data.message, data: newResumeUrl };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update resume';
          set({ isLoading: false });
          return { success: false, message };
        }
      },
    }),
    {
      name: 'auth-storage', // unique name
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Listen to interceptor event
window.addEventListener('auth-unauthorized', () => {
  useAuthStore.getState().logout();
});

export default useAuthStore;
