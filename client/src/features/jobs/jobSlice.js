import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchJobs = createAsyncThunk(
    'jobs/fetchAll',
    async ({ department, jobType, location, search, page, limit }, { rejectWithValue }) => {
        try {
            let url = '/jobs?';
            if (department) url += `department=${department}&`;
            if (jobType) url += `jobType=${jobType}&`;
            if (location) url += `location=${location}&`;
            if (search) url += `search=${search}&`;
            if (page) url += `page=${page}&`;
            if (limit) url += `limit=${limit}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
        }
    }
);

export const fetchJobBySlug = createAsyncThunk(
    'jobs/fetchBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const response = await api.get(`/jobs/${slug}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch job');
        }
    }
);

export const fetchAllJobsAdmin = createAsyncThunk(
    'jobs/fetchAllAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/jobs/admin/all');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
        }
    }
);

export const createJob = createAsyncThunk(
    'jobs/create',
    async (jobData, { rejectWithValue }) => {
        try {
            console.log('Creating job with data:', jobData);
            const response = await api.post('/jobs', jobData);
            return response.data.data;
        } catch (error) {
            console.error('Job creation failed:', error.response?.data);
            const errorMessage = error.response?.data?.message || 'Failed to create job';
            const errors = error.response?.data?.errors;
            if (errors && errors.length > 0) {
                return rejectWithValue(`${errorMessage}: ${errors.map(e => `${e.field} - ${e.message}`).join(', ')}`);
            }
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateJob = createAsyncThunk(
    'jobs/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/jobs/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update job');
        }
    }
);

export const deleteJob = createAsyncThunk(
    'jobs/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/jobs/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete job');
        }
    }
);

const jobSlice = createSlice({
    name: 'jobs',
    initialState: {
        jobs: [],
        currentJob: null,
        isLoading: false,
        error: null,
        pagination: {
            page: 1,
            pages: 1,
            limit: 10,
            total: 0
        }
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentJob: (state) => {
            state.currentJob = null;
        },
        reset: (state) => {
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch jobs
            .addCase(fetchJobs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobs = action.payload.data;
                state.pagination = {
                    ...action.payload.pagination,
                    total: action.payload.total
                };
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch job by slug
            .addCase(fetchJobBySlug.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobBySlug.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentJob = action.payload;
            })
            .addCase(fetchJobBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch all jobs admin
            .addCase(fetchAllJobsAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllJobsAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobs = action.payload;
            })
            .addCase(fetchAllJobsAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create job
            .addCase(createJob.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createJob.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobs.unshift(action.payload);
            })
            .addCase(createJob.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update job
            .addCase(updateJob.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateJob.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.jobs.findIndex(j => j._id === action.payload._id);
                if (index !== -1) {
                    state.jobs[index] = action.payload;
                }
            })
            .addCase(updateJob.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete job
            .addCase(deleteJob.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteJob.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobs = state.jobs.filter(j => j._id !== action.payload);
            })
            .addCase(deleteJob.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearCurrentJob, reset } = jobSlice.actions;
export default jobSlice.reducer;
