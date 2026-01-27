import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async Thunks

// Fetch all resources
export const getResources = createAsyncThunk(
    'resources/getAll',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('/resources');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Add new resource
export const addResource = createAsyncThunk(
    'resources/add',
    async (resourceData, thunkAPI) => {
        try {
            const response = await api.post('/resources', resourceData);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete resource
export const deleteResource = createAsyncThunk(
    'resources/delete',
    async (id, thunkAPI) => {
        try {
            await api.delete(`/resources/${id}`);
            return id;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Upload filled form
export const uploadFilledForm = createAsyncThunk(
    'resources/uploadFilled',
    async ({ id, fileUrl }, thunkAPI) => {
        try {
            const response = await api.put(`/resources/${id}/fill`, { fileUrl });
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Verify form (approve/reject)
export const verifyForm = createAsyncThunk(
    'resources/verify',
    async ({ id, status, message }, thunkAPI) => {
        try {
            const response = await api.put(`/resources/${id}/verify`, { status, message });
            return response.data.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(errorMessage);
        }
    }
);

const resourceSlice = createSlice({
    name: 'resources',
    initialState: {
        resources: [],
        isLoading: false,
        isError: false,
        message: '',
        isSuccess: false
    },
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        },
        // Socket updates
        resourceAdded: (state, action) => {
            state.resources.unshift(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getResources.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getResources.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.resources = action.payload;
            })
            .addCase(getResources.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(addResource.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addResource.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.resources.unshift(action.payload);
            })
            .addCase(addResource.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteResource.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteResource.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.resources = state.resources.filter(r => r._id !== action.payload);
            })
            .addCase(deleteResource.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(uploadFilledForm.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(uploadFilledForm.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Update the resource in the list
                const index = state.resources.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.resources[index] = action.payload;
                }
            })
            .addCase(uploadFilledForm.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(verifyForm.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(verifyForm.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Update the resource in the list
                const index = state.resources.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.resources[index] = action.payload;
                }
            })
            .addCase(verifyForm.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset, resourceAdded } = resourceSlice.actions;
export default resourceSlice.reducer;
