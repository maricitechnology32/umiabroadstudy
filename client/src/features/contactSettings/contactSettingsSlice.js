import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchContactSettings = createAsyncThunk(
    'contactSettings/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/contact-settings');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch contact settings');
        }
    }
);

export const fetchAllContactSettings = createAsyncThunk(
    'contactSettings/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/contact-settings/admin/all');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch all contact settings');
        }
    }
);

export const createContactSettings = createAsyncThunk(
    'contactSettings/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/contact-settings', data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create contact settings');
        }
    }
);

export const updateContactSettings = createAsyncThunk(
    'contactSettings/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/contact-settings/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update contact settings');
        }
    }
);

export const deleteContactSettings = createAsyncThunk(
    'contactSettings/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/contact-settings/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete contact settings');
        }
    }
);

const contactSettingsSlice = createSlice({
    name: 'contactSettings',
    initialState: {
        settings: null,
        allSettings: [],
        isLoading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        reset: (state) => {
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch contact settings
            .addCase(fetchContactSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchContactSettings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.settings = action.payload;
            })
            .addCase(fetchContactSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch all contact settings
            .addCase(fetchAllContactSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllContactSettings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allSettings = action.payload;
            })
            .addCase(fetchAllContactSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create contact settings
            .addCase(createContactSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createContactSettings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.settings = action.payload;
                state.allSettings.unshift(action.payload);
            })
            .addCase(createContactSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update contact settings
            .addCase(updateContactSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateContactSettings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.settings = action.payload;
                const index = state.allSettings.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.allSettings[index] = action.payload;
                }
            })
            .addCase(updateContactSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete contact settings
            .addCase(deleteContactSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteContactSettings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allSettings = state.allSettings.filter(s => s._id !== action.payload);
                if (state.settings?._id === action.payload) {
                    state.settings = null;
                }
            })
            .addCase(deleteContactSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, reset } = contactSettingsSlice.actions;
export default contactSettingsSlice.reducer;
