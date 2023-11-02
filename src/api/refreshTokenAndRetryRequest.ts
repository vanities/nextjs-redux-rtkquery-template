import { HTTPMethods } from "./httpMethods";
import { Paths } from "./paths";
import { updateAuth, logout as logoutState, resetProfile } from "redux/slice";
import { LocalStorage } from "utils";

export async function refreshTokenAndRetryRequest(
  args,
  baseQuery,
  api,
  extraOptions,
) {
  const refreshResult = await baseQuery(
    {
      url: `/${Paths.refresh}`,
      method: HTTPMethods.POST,
      credentials: "include",
    },
    api,
    extraOptions,
  );

  // on success, update the access token, else logout
  const data: any = refreshResult.data;
  if (data) {
    api.dispatch(updateAuth(data.access));
    // retry the initial query
    return await baseQuery(args, api, extraOptions);
  }
  if (refreshResult.error?.status === 401) {
    LocalStorage.clear();
    api.dispatch(logoutState());
    api.dispatch(resetProfile());
  }
}
