import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UIState = {
  homeLoading: boolean;
};

const initialState: UIState = {
  homeLoading: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setHomeLoading(state, action: PayloadAction<boolean>) {
      state.homeLoading = action.payload;
    },
  },
});

export const { setHomeLoading } = uiSlice.actions;
export default uiSlice.reducer;
