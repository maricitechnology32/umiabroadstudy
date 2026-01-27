import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async Thunks
export const fetchPendingDocuments = createAsyncThunk(
    'documents/fetchPending',
    async (status, thunkAPI) => {
        try {
            const query = status ? `?status=${status}` : '?status=Draft,Pending Verification';
            const response = await api.get(`/students/documents/pending${query}`);
            return response.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const verifyUploadDocument = createAsyncThunk(
    'documents/verifyUpload',
    async ({ studentId, docId, file }, thunkAPI) => {
        try {
            // 1. Upload file first
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Call backend to update document record
            const response = await api.put(`/students/${studentId}/documents/${docId}/verify-upload`, {
                verifiedUrl: uploadRes.data.url
            });
            return response.data.data; // Helper returns student docs, but we might just need success
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateDocumentStatus = createAsyncThunk(
    'documents/updateStatus',
    async ({ studentId, docId, status, notes }, thunkAPI) => {
        try {
            const response = await api.put(`/students/${studentId}/documents/${docId}/status`, {
                status,
                notes
            });
            return { studentId, docId, status, notes };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);

const documentSlice = createSlice({
    name: 'documents',
    initialState: {
        pendingDocuments: [],
        isLoading: false,
        error: null,
        successMessage: null
    },
    reducers: {
        clearDocumentState: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Pending
            .addCase(fetchPendingDocuments.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPendingDocuments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pendingDocuments = action.payload;
            })
            .addCase(fetchPendingDocuments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Verify Upload
            .addCase(verifyUploadDocument.fulfilled, (state, action) => {
                state.successMessage = "Document uploaded successfully for verification";
                // Optionally remove from list or update local state if complex
            })
            // Update Status
            .addCase(updateDocumentStatus.fulfilled, (state, action) => {
                state.successMessage = `Document marked as ${action.payload.status}`;
                // Remove from pending list if verified/rejected
                state.pendingDocuments = state.pendingDocuments.filter(
                    doc => doc._id !== action.payload.docId
                );
            });
    }
});

export const { clearDocumentState } = documentSlice.actions;
export default documentSlice.reducer;
