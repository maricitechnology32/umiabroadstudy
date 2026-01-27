

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  students: [],       // List of students (For Consultancy Dashboard)
  currentProfile: null, // The specific profile being viewed (For Student or Admin view)
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// --- THUNKS (ASYNC ACTIONS) ---

// 1. Get "My" Profile (For Student Login)
export const getMyProfile = createAsyncThunk(
  'students/getMe',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/students/me');
      return response.data.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 2. Get Student By ID (For Consultancy Admin View)
export const getStudentById = createAsyncThunk(
  'students/getById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 3. Update Profile (Handles both Student and Admin updates for fields)
export const updateProfile = createAsyncThunk(
  'students/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await api.put(`/students/${id}`, data);
      return response.data.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 4. NEW: Update Student Status (Lead -> Draft -> Verified)
export const updateStudentStatus = createAsyncThunk(
  'students/updateStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      // We use the same PUT endpoint, but sending just the status
      const response = await api.put(`/students/${id}`, { profileStatus: status });
      return response.data.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 5. UPDATE PROCESSING INFO (Visa Status, Dates)
export const updateStudentProcessing = createAsyncThunk(
  'students/updateProcessing',
  async ({ id, processingInfo }, thunkAPI) => {
    try {
      // Sending partial update for processingInfo
      const response = await api.put(`/students/${id}`, { processingInfo });
      return response.data.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 5. Fetch all students list (For Consultancy Dashboard)
export const getStudents = createAsyncThunk(
  'students/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/students');
      return response.data.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 6. Invite a new student
export const inviteStudent = createAsyncThunk(
  'students/invite',
  async (studentData, thunkAPI) => {
    try {
      const response = await api.post('/students/invite', studentData);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- SLICE ---

export const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    // Reset status flags
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    // Clear the profile data (Useful when navigating away from a profile)
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // GET STUDENTS LIST
      .addCase(getStudents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.students = action.payload;
      })
      .addCase(getStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // INVITE STUDENT
      .addCase(inviteStudent.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(inviteStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.students.unshift(action.payload); // Add new student to top of list
        state.message = 'Invitation Sent Successfully!';
      })
      .addCase(inviteStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // GET MY PROFILE
      .addCase(getMyProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // GET STUDENT BY ID (Admin View)
      .addCase(getStudentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStudentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload;
      })
      .addCase(getStudentById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentProfile = action.payload; // Update the view with fresh data
        state.message = 'Profile Updated Successfully!';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // UPDATE STATUS (New)
      .addCase(updateStudentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentProfile = action.payload;
        // Update the list item too so dashboard reflects change immediately
        state.students = state.students.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
        state.message = `Status updated to ${action.payload.profileStatus}`;
      })
      .addCase(updateStudentProcessing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update the specific student in the list with the new data
        state.students = state.students.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
        state.message = 'Visa status updated successfully';
      });
  },
});

export const { reset, clearCurrentProfile } = studentSlice.actions;
export default studentSlice.reducer;