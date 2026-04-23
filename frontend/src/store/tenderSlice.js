import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tenders: [],
  currentTender: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

const tenderSlice = createSlice({
  name: 'tenders',
  initialState,
  reducers: {
    fetchTendersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTendersSuccess: (state, action) => {
      state.loading = false;
      state.tenders = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    fetchTendersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchTenderStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTenderSuccess: (state, action) => {
      state.loading = false;
      state.currentTender = action.payload;
    },
    fetchTenderFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentTender: (state) => {
      state.currentTender = null;
    },
  },
});

export const {
  fetchTendersStart,
  fetchTendersSuccess,
  fetchTendersFailure,
  fetchTenderStart,
  fetchTenderSuccess,
  fetchTenderFailure,
  clearCurrentTender,
} = tenderSlice.actions;

export default tenderSlice.reducer;