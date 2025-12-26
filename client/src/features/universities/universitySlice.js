 


import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  universities: [],
  masterSearchResults: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get All Universities
export const getUniversities = createAsyncThunk('universities/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/universities');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Add University
export const addUniversity = createAsyncThunk('universities/add', async (data, thunkAPI) => {
  try {
    const response = await api.post('/universities', data);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Search Master
export const searchMaster = createAsyncThunk('universities/searchMaster', async (query, thunkAPI) => {
  try {
    const response = await api.get(`/universities/master/search?q=${query}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Import from Master
export const importUniversity = createAsyncThunk('universities/import', async (data, thunkAPI) => {
  try {
    const response = await api.post('/universities/import', data);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Apply Student
export const applyStudent = createAsyncThunk('universities/apply', async (data, thunkAPI) => {
  try {
    const response = await api.post('/universities/apply', data);
    return response.data.data; 
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const universitySlice = createSlice({
  name: 'universities',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
      state.masterSearchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUniversities.pending, (state) => { state.isLoading = true; })
      .addCase(getUniversities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.universities = action.payload;
      })
      .addCase(addUniversity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.universities.push(action.payload);
        state.message = 'University Added';
      })
      .addCase(importUniversity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.universities.push(action.payload);
        state.message = 'University Imported';
      })
      .addCase(searchMaster.fulfilled, (state, action) => {
        state.masterSearchResults = action.payload;
      })
      .addCase(applyStudent.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Application Added';
      });
  },
});

export const { reset } = universitySlice.actions;
export default universitySlice.reducer;