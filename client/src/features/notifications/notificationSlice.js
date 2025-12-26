import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

// Mark single notification as read
export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, thunkAPI) => {
        try {
            const response = await api.put(`/notifications/${notificationId}/read`);
            return { id: notificationId, data: response.data };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
        }
    }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, thunkAPI) => {
        try {
            await api.put('/notifications/read-all');
            return true;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
        }
    }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (notificationId, thunkAPI) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            return notificationId;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
        }
    }
);

// Clear all notifications
export const clearAllNotifications = createAsyncThunk(
    'notifications/clearAllNotifications',
    async (_, thunkAPI) => {
        try {
            await api.delete('/notifications');
            return true;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to clear notifications');
        }
    }
);

const initialState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    }
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // Add real-time notification from socket
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        // Remove notification locally
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n._id !== action.payload && n.id !== action.payload);
        },
        // Reset state
        resetNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload.data;
                state.unreadCount = action.payload.unreadCount;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Mark as read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n._id === action.payload.id);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Mark all as read
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => n.isRead = true);
                state.unreadCount = 0;
            })
            // Delete notification
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n._id === action.payload);
                if (notification && !notification.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications = state.notifications.filter(n => n._id !== action.payload);
            })
            // Clear all
            .addCase(clearAllNotifications.fulfilled, (state) => {
                state.notifications = [];
                state.unreadCount = 0;
            });
    }
});

export const { addNotification, removeNotification, resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
