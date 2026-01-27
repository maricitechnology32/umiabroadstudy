import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async Thunks
export const fetchSiteContent = createAsyncThunk(
    'siteContent/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/site-content');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch site content');
        }
    }
);

export const updateSiteContent = createAsyncThunk(
    'siteContent/update',
    async (contentData, { rejectWithValue }) => {
        try {
            const response = await api.put('/site-content', contentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update site content');
        }
    }
);

const initialState = {
    content: null,
    loading: false,
    error: null,
    updateSuccess: false
};

const siteContentSlice = createSlice({
    name: 'siteContent',
    initialState,
    reducers: {
        resetUpdateSuccess: (state) => {
            state.updateSuccess = false;
        }
    },
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchSiteContent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSiteContent.fulfilled, (state, action) => {
                state.loading = false;
                state.content = action.payload.data;
            })
            .addCase(fetchSiteContent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update
        builder
            .addCase(updateSiteContent.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateSuccess = false;
            })
            .addCase(updateSiteContent.fulfilled, (state, action) => {
                state.loading = false;
                state.content = action.payload.data;
                state.updateSuccess = true;
            })
            .addCase(updateSiteContent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.updateSuccess = false;
            });
    }
});

export const { resetUpdateSuccess } = siteContentSlice.actions;
export default siteContentSlice.reducer;
