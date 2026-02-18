import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserState = {
  clerkId: string;
  username: string;
  name: string;
  email: string;

  coins: number;
  gems: number;
  level: number;

  imageUrl: string;
  isLoaded: boolean;
};

const initialState: UserState = {
  clerkId: "",
  username: "Player",
  name: "Player",
  email: "",

  coins: 0,
  gems: 0,
  level: 1,

  imageUrl: "",
  isLoaded: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload, isLoaded: true };
    },

    resetUser() {
      return initialState;
    },
  },
});

export const { setUserData, resetUser } = userSlice.actions;
export default userSlice.reducer;
