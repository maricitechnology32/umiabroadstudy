import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  consultancies: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Fetch all consultancies
export const getConsultancies = createAsyncThunk(
  'consultancies/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/consultancies');
      return response.data.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new consultancy
export const createConsultancy = createAsyncThunk(
  'consultancies/create',
  async (consultancyData, thunkAPI) => {
    try {
      const response = await api.post('/consultancies', consultancyData);
      return response.data.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const consultancySlice = createSlice({
  name: 'consultancy',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConsultancies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConsultancies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.consultancies = action.payload;
      })
      .addCase(getConsultancies.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createConsultancy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.consultancies.unshift(action.payload); // Add new one to top of list
      });
  },
});

export const { reset } = consultancySlice.actions;
export default consultancySlice.reducer;