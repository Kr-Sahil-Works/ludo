import { configureStore, combineReducers } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";
import uiReducer from "./uiSlice";
import appReducer from "./appSlice";
import userReducer from "./userSlice";


import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";

// ✅ root reducer
const rootReducer = combineReducers({
  game: gameReducer,
  ui: uiReducer,
  app: appReducer,
  user: userReducer, // ✅ ADD THIS
});

// ✅ persist config
const persistConfig = {
  key: "root",
  storage: AsyncStorage,

  // ✅ IMPORTANT: persist game so resume stays after restart
  whitelist: ["game"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ store
export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux persist needs this off
    }),
});

// ✅ persistor
export const persistor = persistStore(store);

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
