import { combineReducers } from "@reduxjs/toolkit";

import gameReducer from "./gameSlice";
import uiReducer from "./uiSlice";
import userReducer from "./userSlice"; // ✅ ADD THIS

const rootReducer = combineReducers({
  game: gameReducer,
  ui: uiReducer,
  user: userReducer, // ✅ ADD THIS
});

export default rootReducer;
