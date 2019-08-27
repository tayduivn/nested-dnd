import getExploreUrlParams from "./getExploreUrlParams";

export { getExploreUrlParams };
export const locationSelector = state => ({ ...state.router.location, ...window.location });
