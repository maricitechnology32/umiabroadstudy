import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
    aboutUs: null,
    aboutUsList: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: ''
};

// Fetch public About Us content
export const fetchAboutUs = createAsyncThunk(
    'aboutUs/fetch',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('/about');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch About Us';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Fetch About Us for admin (all records)
export const fetchAboutUsAdmin = createAsyncThunk(
    'aboutUs/fetchAdmin',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('/about/admin');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Create About Us
export const createAboutUs = createAsyncThunk(
    'aboutUs/create',
    async (aboutUsData, thunkAPI) => {
        try {
            const response = await api.post('/about', aboutUsData);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update About Us
export const updateAboutUs = createAsyncThunk(
    'aboutUs/update',
    async ({ id, data }, thunkAPI) => {
        try {
            const response = await api.put(`/about/${id}`, data);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete About Us
export const deleteAboutUs = createAsyncThunk(
    'aboutUs/delete',
    async (id, thunkAPI) => {
        try {
            await api.delete(`/about/${id}`);
            return id;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Add team member
export const addTeamMember = createAsyncThunk(
    'aboutUs/addTeamMember',
    async ({ id, memberData }, thunkAPI) => {
        try {
            const response = await api.post(`/about/${id}/team`, memberData);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Remove team member
export const removeTeamMember = createAsyncThunk(
    'aboutUs/removeTeamMember',
    async ({ id, teamMemberId }, thunkAPI) => {
        try {
            const response = await api.delete(`/about/${id}/team/${teamMemberId}`);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const aboutUsSlice = createSlice({
    name: 'aboutUs',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch About Us (Public)
            .addCase(fetchAboutUs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAboutUs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.aboutUs = action.payload;
            })
            .addCase(fetchAboutUs.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Fetch About Us Admin
            .addCase(fetchAboutUsAdmin.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAboutUsAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.aboutUsList = action.payload;
            })
            .addCase(fetchAboutUsAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Create About Us
            .addCase(createAboutUs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createAboutUs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.aboutUsList.push(action.payload);
                state.message = 'About Us content created successfully';
            })
            .addCase(createAboutUs.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Update About Us
            .addCase(updateAboutUs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateAboutUs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.aboutUs = action.payload;
                const index = state.aboutUsList.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.aboutUsList[index] = action.payload;
                }
                state.message = 'About Us content updated successfully';
            })
            .addCase(updateAboutUs.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Delete About Us
            .addCase(deleteAboutUs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteAboutUs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.aboutUsList = state.aboutUsList.filter(item => item._id !== action.payload);
                state.message = 'About Us content deleted successfully';
            })
            .addCase(deleteAboutUs.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Add Team Member
            .addCase(addTeamMember.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addTeamMember.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.aboutUs = action.payload;
                state.message = 'Team member added successfully';
            })
            .addCase(addTeamMember.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Remove Team Member
            .addCase(removeTeamMember.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(removeTeamMember.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.aboutUs = action.payload;
                state.message = 'Team member removed successfully';
            })
            .addCase(removeTeamMember.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = aboutUsSlice.actions;
export default aboutUsSlice.reducer;
