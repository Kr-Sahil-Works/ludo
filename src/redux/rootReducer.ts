import { combineReducers } from "@reduxjs/toolkit";

import gameReducer from "./gameSlice";
import uiReducer from "./uiSlice"; // ✅ ADD THIS

const rootReducer = combineReducers({
  game: gameReducer,
  ui: uiReducer, // ✅ ADD THIS
});

export default rootReducer;
