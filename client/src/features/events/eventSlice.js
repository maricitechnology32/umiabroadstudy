import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
    events: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
};

// Get All Events for Consultancy
export const getEvents = createAsyncThunk('events/getAll', async (_, thunkAPI) => {
    try {
        const response = await api.get('/events');
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Add Event
export const addEvent = createAsyncThunk('events/add', async (data, thunkAPI) => {
    try {
        const response = await api.post('/events', data);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Update Event
export const updateEvent = createAsyncThunk('events/update', async ({ id, data }, thunkAPI) => {
    try {
        const response = await api.put(`/events/${id}`, data);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Delete Event
export const deleteEvent = createAsyncThunk('events/delete', async (id, thunkAPI) => {
    try {
        await api.delete(`/events/${id}`);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const eventSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Events
            .addCase(getEvents.pending, (state) => { state.isLoading = true; })
            .addCase(getEvents.fulfilled, (state, action) => {
                state.isLoading = false;
                state.events = action.payload;
            })
            .addCase(getEvents.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Add Event
            .addCase(addEvent.pending, (state) => { state.isLoading = true; })
            .addCase(addEvent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.events.push(action.payload);
                state.message = 'Event Created';
            })
            .addCase(addEvent.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Update Event
            .addCase(updateEvent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.events = state.events.map(e =>
                    e._id === action.payload._id ? action.payload : e
                );
                state.message = 'Event Updated';
            })
            // Delete Event
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.events = state.events.filter(e => e._id !== action.payload);
                state.message = 'Event Deleted';
            });
    },
});

export const { reset } = eventSlice.actions;
export default eventSlice.reducer;
