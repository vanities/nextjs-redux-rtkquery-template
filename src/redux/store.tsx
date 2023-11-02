import { configureStore, ThunkAction } from "@reduxjs/toolkit";
import { Action } from "redux";
import { createWrapper } from "next-redux-wrapper";
import { reducer } from "redux/reducer";
import { api } from "api";

const makeStore = () => {
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these field paths in all actions
          ignoredActionPaths: [
            "payload.provider",
            "meta.baseQueryMeta.request",
            "meta.baseQueryMeta.response",
            "meta.arg.originalArgs",
          ],
          // Ignore these paths in the state
          ignoredPaths: ["wallet.data.primary.provider"],
        },
      }).concat(api.middleware),
    devTools: true,
  });
};

export type RootStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<RootStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action
>;
export type AppDispatch = RootStore["dispatch"];

export const wrapper = createWrapper<RootStore>(makeStore);
