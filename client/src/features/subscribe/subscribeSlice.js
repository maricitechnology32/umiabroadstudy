import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const subscribeToNewsletter = createAsyncThunk(
    'subscribe/new',
    async (email, { rejectWithValue }) => {
        try {
            const response = await api.post('/subscribe', { email });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to subscribe');
        }
    }
);

const subscribeSlice = createSlice({
    name: 'subscribe',
    initialState: {
        isLoading: false,
        success: false,
        message: null,
        error: null
    },
    reducers: {
        resetSubscribe: (state) => {
            state.isLoading = false;
            state.success = false;
            state.message = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(subscribeToNewsletter.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(subscribeToNewsletter.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.message = action.payload.message;
            })
            .addCase(subscribeToNewsletter.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.success = false;
            });
    }
});

export const { resetSubscribe } = subscribeSlice.actions;
export default subscribeSlice.reducer;
