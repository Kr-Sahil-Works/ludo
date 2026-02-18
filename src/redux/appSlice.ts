import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AppState = {
  isConnected: boolean;
  isSignedIn: boolean;
  onlineReady: boolean;
};

const initialState: AppState = {
  isConnected: true,
  isSignedIn: false,
  onlineReady: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setConnection(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
      state.onlineReady = state.isConnected && state.isSignedIn;
    },

    setSignedIn(state, action: PayloadAction<boolean>) {
      state.isSignedIn = action.payload;
      state.onlineReady = state.isConnected && state.isSignedIn;
    },
  },
});

export const { setConnection, setSignedIn } = appSlice.actions;
export default appSlice.reducer;
