import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./profileSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    auth: authReducer,
  },
});
