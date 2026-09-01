import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  role: 'student' | 'guardian' | 'tutor' | 'admin' | 'super_admin' | 'moderator' | 'coaching';
  phone?: string;
  avatar?: string;
  location?: string;
  address?: string;
  isEmailVerified: boolean;
  isApproved: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getSavedUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.user && typeof parsed.user === 'object') {
      return parsed.user;
    }
    return parsed;
  } catch {
    return null;
  }
};

const savedUser = getSavedUser();
const savedToken = localStorage.getItem('accessToken');

const initialState: AuthState = {
  user: savedUser,
  accessToken: savedToken || null,
  isAuthenticated: Boolean(savedToken),
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, setAccessToken, setUser, setAuthLoading, logout } =
  authSlice.actions;

export default authSlice.reducer;
