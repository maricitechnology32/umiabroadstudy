import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunk to fetch consolidated landing page data
export const fetchLandingData = createAsyncThunk(
    'landing/fetchData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/landing-data');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch landing data');
        }
    }
);

const landingSlice = createSlice({
    name: 'landing',
    initialState: {
        branding: null,
        content: null,
        about: null,
        contact: null,
        isLoading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLandingData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchLandingData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.branding = action.payload.branding;
                state.content = action.payload.content;
                state.about = action.payload.about;
                state.contact = action.payload.contact;
            })
            .addCase(fetchLandingData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = landingSlice.actions;
export default landingSlice.reducer;
