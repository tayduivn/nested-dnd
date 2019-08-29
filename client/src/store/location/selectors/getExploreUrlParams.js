import { createMatchSelector } from "connected-react-router";

const LOADING = "";

const getIndexFromHash = hash => (hash ? parseInt(hash.substr(1), 10) : LOADING);

const explorePath = createMatchSelector({ path: "/explore/:type/:id" });

/**
 * @returns {object} result
 * @returns {number} result.index
 * @returns {object} result.match
 */
const getExploreUrlParams = state => {
	const location = state.router.location;
	const match = explorePath(state) || { params: {} };
	const index = getIndexFromHash(location.hash);
	return { index, match };
};
export default getExploreUrlParams;
