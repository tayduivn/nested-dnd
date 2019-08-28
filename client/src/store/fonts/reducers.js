import { LOAD_FONTS_RECEIVED, LOAD_FONTS_START } from "store/fonts/actions";

export default function fonts(state = {}, action = {}) {
	let newState = {};
	switch (action.type) {
		case LOAD_FONTS_RECEIVED:
			newState = { ...state };
			action.fonts.forEach(font => (newState[font] = "loaded"));
			return newState;
		case LOAD_FONTS_START:
			newState = { ...state };
			action.fonts.forEach(font => (newState[font] = "loading"));
			return newState;
		default:
			return state;
	}
}
