import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
    blogs: [],
    currentBlog: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    }
};

// Fetch public blogs (published only, with pagination)
export const fetchBlogs = createAsyncThunk(
    'blog/fetchBlogs',
    async ({ page = 1, limit = 10, category, search }, thunkAPI) => {
        try {
            let url = `/blogs?page=${page}&limit=${limit}`;
            if (category) url += `&category=${category}`;
            if (search) url += `&search=${search}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch blogs';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Fetch single blog by slug
export const fetchBlogBySlug = createAsyncThunk(
    'blog/fetchBySlug',
    async (slug, thunkAPI) => {
        try {
            const response = await api.get(`/blogs/${slug}`);
            // Increment view count
            await api.put(`/blogs/${slug}/view`);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch blog';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Fetch all blogs for admin
export const fetchBlogsAdmin = createAsyncThunk(
    'blog/fetchBlogsAdmin',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('/blogs/admin/all');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch blogs';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Create blog
export const createBlog = createAsyncThunk(
    'blog/create',
    async (blogData, thunkAPI) => {
        try {
            const response = await api.post('/blogs', blogData);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create blog';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update blog
export const updateBlog = createAsyncThunk(
    'blog/update',
    async ({ id, data }, thunkAPI) => {
        try {
            const response = await api.put(`/blogs/${id}`, data);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update blog';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete blog
export const deleteBlog = createAsyncThunk(
    'blog/delete',
    async (id, thunkAPI) => {
        try {
            await api.delete(`/blogs/${id}`);
            return id;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete blog';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        },
        clearCurrentBlog: (state) => {
            state.currentBlog = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Blogs (Public)
            .addCase(fetchBlogs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.blogs = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Fetch Blog by Slug
            .addCase(fetchBlogBySlug.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.currentBlog = action.payload;
            })
            .addCase(fetchBlogBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Fetch Blogs Admin
            .addCase(fetchBlogsAdmin.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchBlogsAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.blogs = action.payload;
            })
            .addCase(fetchBlogsAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Create Blog
            .addCase(createBlog.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createBlog.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.blogs.unshift(action.payload);
                state.message = 'Blog created successfully';
            })
            .addCase(createBlog.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Update Blog
            .addCase(updateBlog.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateBlog.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.blogs.findIndex(blog => blog._id === action.payload._id);
                if (index !== -1) {
                    state.blogs[index] = action.payload;
                }
                state.currentBlog = action.payload;
                state.message = 'Blog updated successfully';
            })
            .addCase(updateBlog.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Delete Blog
            .addCase(deleteBlog.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteBlog.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.blogs = state.blogs.filter(blog => blog._id !== action.payload);
                state.message = 'Blog deleted successfully';
            })
            .addCase(deleteBlog.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset, clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer;
