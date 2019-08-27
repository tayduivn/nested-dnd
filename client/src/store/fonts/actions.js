import WebFont from "webfontloader";

import DB from "util/DB";

export const LOAD_FONTS = "LOAD_FONTS";
export function loadFonts(fonts = [], source = "google") {
	return (dispatch, getState) => {
		if (!fonts) return;
		if (!(fonts instanceof Array)) fonts = [fonts];

		// remove fonts already loaded
		const loadedFonts = Object.keys(getState().fonts);
		const trimmedFonts = fonts.filter(d => !loadedFonts.includes(d));
		const newState = {};
		trimmedFonts.forEach(f => (newState[f] = "loading"));

		if (trimmedFonts.length) {
			WebFont.load({
				[source]: {
					families: fonts
				},
				active: function() {
					trimmedFonts.forEach(f => (newState[f] = "loaded"));
					dispatch({
						type: LOAD_FONTS,
						fonts: newState
					});
				}
			});
			dispatch({
				type: LOAD_FONTS,
				fonts: newState
			});
		}
	};
}
