import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as enrollmentService from '../../services/enrollmentService';

export const fetchMyEnrollments = createAsyncThunk('enrollments/fetchMine', async (userId, { rejectWithValue }) => {
  try {
    return await enrollmentService.getUserEnrollments(userId);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load enrollments');
  }
});

export const enroll = createAsyncThunk('enrollments/enroll', async (courseId, { rejectWithValue }) => {
  try {
    return await enrollmentService.enrollInCourse(courseId);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to enroll');
  }
});

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(enroll.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default enrollmentSlice.reducer;
