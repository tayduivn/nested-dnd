import WebFont from "webfontloader";

export const LOAD_FONTS_START = "LOAD_FONTS_START";
export const LOAD_FONTS_RECEIVED = "LOAD_FONTS_RECEIVED";
export function loadFonts(fonts = [], source = "google") {
	return (dispatch, getState) => {
		if (!fonts) return;
		if (!(fonts instanceof Array)) fonts = [fonts];

		// remove fonts already loaded
		const loadedFonts = Object.keys(getState().fonts);
		const trimmedFonts = fonts.filter(d => !loadedFonts.includes(d));

		if (trimmedFonts.length) {
			dispatch({
				type: LOAD_FONTS_START,
				fonts: trimmedFonts
			});
			WebFont.load({
				[source]: {
					families: trimmedFonts
				},
				active: function() {
					dispatch({
						type: LOAD_FONTS_RECEIVED,
						fonts: trimmedFonts
					});
				}
			});
		}
	};
}
