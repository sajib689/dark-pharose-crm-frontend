import { configureStore } from "@reduxjs/toolkit";
import { pharosApi } from "./api";

export const store = configureStore({
  reducer: {
    [pharosApi.reducerPath]: pharosApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(pharosApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
