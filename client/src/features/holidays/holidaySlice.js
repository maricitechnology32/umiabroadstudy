import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  holidays: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get All Holidays
export const getHolidays = createAsyncThunk('holidays/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/holidays');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Add Holiday (Super Admin)
export const addHoliday = createAsyncThunk('holidays/add', async (data, thunkAPI) => {
  try {
    const response = await api.post('/holidays', data);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Delete Holiday (Super Admin)
export const deleteHoliday = createAsyncThunk('holidays/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/holidays/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const holidaySlice = createSlice({
  name: 'holidays',
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
      .addCase(getHolidays.pending, (state) => { state.isLoading = true; })
      .addCase(getHolidays.fulfilled, (state, action) => {
        state.isLoading = false;
        state.holidays = action.payload;
      })
      .addCase(addHoliday.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.holidays.push(action.payload);
        state.message = 'Holiday Added';
      })
      .addCase(deleteHoliday.fulfilled, (state, action) => {
        state.isLoading = false;
        state.holidays = state.holidays.filter(h => h._id !== action.payload);
        state.message = 'Holiday Deleted';
      });
  },
});

export const { reset } = holidaySlice.actions;
export default holidaySlice.reducer;