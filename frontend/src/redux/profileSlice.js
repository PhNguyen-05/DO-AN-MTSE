import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getAuthorizationHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

// Thunk to fetch profile
export const fetchProfile = createAsyncThunk("profile/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/profile", {
      headers: {
        Authorization: getAuthorizationHeader()
      }
    });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
  }
});

// Thunk to update profile
export const updateProfile = createAsyncThunk("profile/updateProfile", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.put("/api/profile", formData, {
      headers: {
        Authorization: getAuthorizationHeader(),
        "Content-Type": "multipart/form-data" // For avatar upload
      }
    });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.response?.data?.errors || "Failed to update profile");
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: null,
    loading: false,
    error: null,
    updateSuccess: false
  },
  reducers: {
    resetUpdateStatus: (state) => {
      state.updateSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder.addCase(fetchProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    // Update Profile
    builder.addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.updateSuccess = true;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { resetUpdateStatus } = profileSlice.actions;
export default profileSlice.reducer;
