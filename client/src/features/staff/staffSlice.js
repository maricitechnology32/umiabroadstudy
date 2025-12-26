import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  staffList: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all staff
export const getStaff = createAsyncThunk('staff/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/staff');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Add new staff
export const addStaff = createAsyncThunk('staff/add', async (staffData, thunkAPI) => {
  try {
    const response = await api.post('/staff', staffData);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Remove staff
export const removeStaff = createAsyncThunk('staff/remove', async (id, thunkAPI) => {
  try {
    await api.delete(`/staff/${id}`);
    return id; // Return ID to filter it out locally
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStaff.pending, (state) => { state.isLoading = true; })
      .addCase(getStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffList = action.payload;
      })
      .addCase(addStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staffList.push(action.payload);
        state.message = 'Staff member added successfully';
      })
      .addCase(removeStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffList = state.staffList.filter((staff) => staff._id !== action.payload);
        state.message = 'Staff member removed';
      })
      .addCase(addStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = staffSlice.actions;
export default staffSlice.reducer;