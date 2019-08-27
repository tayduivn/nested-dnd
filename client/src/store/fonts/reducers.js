export default function fonts(state = {}, action = {}) {
	switch (action.type) {
		case "LOAD_FONTS":
			return { ...state, ...action.fonts };
		default:
			return state;
	}
}
