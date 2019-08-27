import { createMatchSelector } from "connected-react-router";

const LOADING = "";

const getIndexFromHash = hash => (hash ? parseInt(hash.substr(1), 10) : LOADING);

const explorePath = createMatchSelector({ path: "/explore/:type/:id" });

const getExploreUrlParams = state => {
	const location = state.router.location;
	const match = explorePath(state);
	const index = getIndexFromHash(location.hash);
	return { index, match };
};
export default getExploreUrlParams;
