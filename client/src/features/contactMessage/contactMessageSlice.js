import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const submitContactMessage = createAsyncThunk(
    'contactMessages/submit',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/contact-messages', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit message');
        }
    }
);

export const fetchContactMessages = createAsyncThunk(
    'contactMessages/fetchAll',
    async ({ status, search, page, limit }, { rejectWithValue }) => {
        try {
            let url = '/contact-messages?';
            if (status) url += `status=${status}&`;
            if (search) url += `search=${search}&`;
            if (page) url += `page=${page}&`;
            if (limit) url += `limit=${limit}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
        }
    }
);

export const fetchContactMessageById = createAsyncThunk(
    'contactMessages/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/contact-messages/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch message');
        }
    }
);

export const updateMessageStatus = createAsyncThunk(
    'contactMessages/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/contact-messages/${id}/status`, { status });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

export const deleteContactMessage = createAsyncThunk(
    'contactMessages/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/contact-messages/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete message');
        }
    }
);

const contactMessageSlice = createSlice({
    name: 'contactMessages',
    initialState: {
        messages: [],
        currentMessage: null,
        isLoading: false,
        error: null,
        successMessage: null,
        pagination: {
            page: 1,
            pages: 1,
            limit: 20,
            total: 0
        }
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.successMessage = null;
        },
        clearCurrentMessage: (state) => {
            state.currentMessage = null;
        },
        reset: (state) => {
            state.isLoading = false;
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Submit message
            .addCase(submitContactMessage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(submitContactMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(submitContactMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch all messages
            .addCase(fetchContactMessages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchContactMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.messages = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchContactMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch message by ID
            .addCase(fetchContactMessageById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchContactMessageById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentMessage = action.payload;
            })
            .addCase(fetchContactMessageById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update message status
            .addCase(updateMessageStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateMessageStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.messages.findIndex(m => m._id === action.payload._id);
                if (index !== -1) {
                    state.messages[index] = action.payload;
                }
                if (state.currentMessage?._id === action.payload._id) {
                    state.currentMessage = action.payload;
                }
            })
            .addCase(updateMessageStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete message
            .addCase(deleteContactMessage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteContactMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.messages = state.messages.filter(m => m._id !== action.payload);
            })
            .addCase(deleteContactMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, clearCurrentMessage, reset } = contactMessageSlice.actions;
export default contactMessageSlice.reducer;
