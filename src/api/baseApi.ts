import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  retry,
} from "@reduxjs/toolkit/query/react";
import { RetryOptions } from "@reduxjs/toolkit/src/query/retry";
import { HYDRATE } from "next-redux-wrapper";
import { Mutex } from "async-mutex";

import type { Auth } from "types";
import { isTokenExpired, HmacService } from "utils";
import { Headers } from "./headers";
import { RootState } from "redux/store";
import { refreshTokenAndRetryRequest } from "./refreshTokenAndRetryRequest";

const mutex = new Mutex();

// add a path here if we're requiring HMAC
const anonymousEndpoints = [];

// add an endpoint  here if we're requiring JWT
const jwtRequiredEndpoints = [];

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.API_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    // By default, if we have a token in the store, let's use that for authenticated requests
    const accessToken = ((getState() as RootState).auth as Auth).accessToken;
    if (accessToken && jwtRequiredEndpoints.includes(endpoint)) {
      headers.set(Headers.Authorization, `Bearer ${accessToken}`);
    }
    return headers;
  },
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<
  any,
  unknown,
  unknown,
  RetryOptions,
  {}
> = retry(
  async (args, api, extraOptions) => {
    // HMAC AUTH
    if (anonymousEndpoints.includes(api.endpoint)) {
      args.headers = {
        ...args.headers,
        Signature: HmacService.sign(JSON.stringify(args.body)),
      };
      const result = await baseQuery(args, api, extraOptions);
      return result;
    }

    // JWT AUTH
    if (jwtRequiredEndpoints.includes(api.endpoint)) {
      await mutex.waitForUnlock();
      // check if token is expired
      let result = null;
      const apiState = (api.getState() as RootState).auth as Auth;

      // not logged in at all
      if (!apiState.isAuthenticated) {
        return { error: "Not Authenticated" };
      }

      if (
        !apiState.accessToken ||
        isTokenExpired(apiState.accessToken, Date.now())
      ) {
        if (!mutex.isLocked()) {
          const release = await mutex.acquire();
          try {
            result = await refreshTokenAndRetryRequest(
              args,
              baseQuery,
              api,
              extraOptions,
            );

            if (result.error?.status >= 500 || result.error?.status === 404) {
              retry.fail(result.error);
            }

            if (result.error && result.error.status === 401) {
              result = await refreshTokenAndRetryRequest(
                args,
                baseQuery,
                api,
                extraOptions,
              );
            }
          } finally {
            // release must be called once the mutex should be released again.
            release();
          }
        }
      } else {
        // wait until the mutex is available without locking it
        await mutex.waitForUnlock();
        result = await baseQuery(args, api, extraOptions);
      }
      return result;
    }

    // BASE
    const result = await baseQuery(args, api, extraOptions);
    return result;
  },
  {
    maxRetries: 2,
  },
);

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
  endpoints: () => ({}),
});

export const {
  util: { getRunningQueriesThunk },
} = api;
