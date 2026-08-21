import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as courseService from '../../services/courseService';

export const fetchCourses = createAsyncThunk('courses/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await courseService.getCourses(params);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load courses');
  }
});

export const fetchCourseById = createAsyncThunk('courses/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return await courseService.getCourse(id);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load course');
  }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    activeCourse: null,
    status: 'idle',
    error: null,
    filters: { search: '', category: '', level: '', sort: '-createdAt', page: 1 },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearActiveCourse: (state) => {
      state.activeCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.courses;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCourseById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activeCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearActiveCourse } = courseSlice.actions;
export default courseSlice.reducer;
