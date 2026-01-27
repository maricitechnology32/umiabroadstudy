import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/axiosConfig'; // Updated: Use new secure axios config
import { storeCSRFToken, clearCSRFToken } from '../../utils/csrf';

// Check user in localStorage on initial load
const localUser = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: localUser,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  // Phase 2: Account lockout state
  isLocked: false,
  lockedUntil: null,
  attemptsRemaining: null,
};

/**
 * Login User (Enhanced with Phase 2 features)
 */
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/login', userData);

    if (response.data && response.data.success) {
      // 1. Save User Data
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // 2. Store CSRF Token (Phase 2) 
      if (response.data.csrfToken) {
        storeCSRFToken(response.data.csrfToken);
      }

      // 3. Store access token (optional - cookies handle this)
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }

      return response.data.user;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    // Handle account lockout (423 status)
    if (error.response?.status === 423) {
      return thunkAPI.rejectWithValue({
        message: error.response.data.message,
        lockedUntil: error.response.data.lockedUntil,
        isLocked: true
      });
    }

    // Handle other errors with attempts remaining
    const message = error.response?.data?.message || error.message || 'Login failed';
    return thunkAPI.rejectWithValue({
      message,
      attemptsRemaining: error.response?.data?.attemptsRemaining,
      isLocked: false
    });
  }
});

/**
 * Logout User (Enhanced with Phase 2 features)
 */
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.get('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Clear everything
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  clearCSRFToken();

  return true;
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.isLocked = false;
      state.lockedUntil = null;
      state.attemptsRemaining = null;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearLockout: (state) => {
      state.isLocked = false;
      state.lockedUntil = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
        state.isLocked = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.isError = false;
        state.message = '';
        state.isLocked = false;
        state.attemptsRemaining = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || action.payload;
        state.user = null;

        // Phase 2: Handle account lockout
        if (action.payload?.isLocked) {
          state.isLocked = true;
          state.lockedUntil = action.payload.lockedUntil;
        }

        // Show attempts remaining
        if (action.payload?.attemptsRemaining !== undefined) {
          state.attemptsRemaining = action.payload.attemptsRemaining;
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
        state.isLocked = false;
        state.lockedUntil = null;
        state.attemptsRemaining = null;
      });
  },
});

export const { reset, updateUser, clearLockout } = authSlice.actions;
export default authSlice.reducer;