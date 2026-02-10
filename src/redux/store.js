import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import mmkvStorage from "./mmkvStorage";
import gameReducer from "./gameSlice";

const rootReducer = combineReducers({
  game: gameReducer,
});

const persistConfig = {
  key: "root",
  storage: mmkvStorage,
  whitelist: ["game"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
