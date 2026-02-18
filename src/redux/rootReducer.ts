import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import uiReducer from "./uiSlice";
import gameReducer from "./gameSlice";
import appReducer from "./appSlice";

const rootReducer = combineReducers({
  ui: uiReducer,
  user: userReducer,
  game: gameReducer,
  app: appReducer,
});

export default rootReducer;
