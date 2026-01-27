import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const submitJobApplication = createAsyncThunk(
    'jobApplications/submit',
    async (applicationData, { rejectWithValue }) => {
        try {
            const response = await api.post('/job-applications', applicationData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit application');
        }
    }
);

export const fetchMyApplications = createAsyncThunk(
    'jobApplications/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/job-applications/my-applications');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
        }
    }
);

export const fetchApplications = createAsyncThunk(
    'jobApplications/fetchAll',
    async ({ status, search, jobId, page, limit }, { rejectWithValue }) => {
        try {
            let url = '/job-applications?';
            if (status) url += `status=${status}&`;
            if (search) url += `search=${search}&`;
            if (jobId) url += `jobId=${jobId}&`;
            if (page) url += `page=${page}&`;
            if (limit) url += `limit=${limit}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
        }
    }
);

export const fetchApplicationById = createAsyncThunk(
    'jobApplications/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/job-applications/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch application');
        }
    }
);

export const updateApplicationStatus = createAsyncThunk(
    'jobApplications/updateStatus',
    async ({ id, status, notes }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/job-applications/${id}/status`, { status, notes });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

export const deleteApplication = createAsyncThunk(
    'jobApplications/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/job-applications/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete application');
        }
    }
);

const jobApplicationSlice = createSlice({
    name: 'jobApplications',
    initialState: {
        applications: [],
        currentApplication: null,
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
        clearCurrentApplication: (state) => {
            state.currentApplication = null;
        },
        reset: (state) => {
            state.isLoading = false;
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Submit application
            .addCase(submitJobApplication.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(submitJobApplication.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(submitJobApplication.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch my applications
            .addCase(fetchMyApplications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyApplications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.applications = action.payload;
            })
            .addCase(fetchMyApplications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch applications
            .addCase(fetchApplications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchApplications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.applications = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchApplications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch application by ID
            .addCase(fetchApplicationById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchApplicationById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentApplication = action.payload;
            })
            .addCase(fetchApplicationById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update application status
            .addCase(updateApplicationStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateApplicationStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.applications.findIndex(a => a._id === action.payload._id);
                if (index !== -1) {
                    state.applications[index] = action.payload;
                }
            })
            .addCase(updateApplicationStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete application
            .addCase(deleteApplication.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteApplication.fulfilled, (state, action) => {
                state.isLoading = false;
                state.applications = state.applications.filter(a => a._id !== action.payload);
            })
            .addCase(deleteApplication.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, clearCurrentApplication, reset } = jobApplicationSlice.actions;
export default jobApplicationSlice.reducer;
