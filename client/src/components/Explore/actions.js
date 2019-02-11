import DB from "../../actions/CRUDAction";
import {
	UNIVERSE_SET,
	INSTANCE_SET,
	INSTANCE_ADD_CHILD,
	INSTANCE_DELETE
} from "../Universes/actions";
import { SET_PACK } from "../Packs/actions";

import debounce from "debounce";
import async from "async";
import store from "../App/store";

const INSTANCE = "Instance";
const UNIVERSE = "Universe";
const Pack = "Pack";

const LOAD_EXPLORE = "LOAD_EXPLORE";

const saver = async.cargo((tasks, callback) => {
	var universes = {};

	tasks.forEach(t => {
		if (!t.universe) return;

		var universe = universes[t.universe];
		if (!universe) universe = universes[t.universe] = { array: {} };

		var index = universe.array[t.index];
		if (!index) index = universe.array[t.index] = {};

		index[t.property] = t.value;
	});
	var promises = [];

	for (var id in universes) {
		var promise = DB.set(`universes`, id, universes[id]).then(({ error, data }) => {
			return data.result;
			//if (error).result this.setState({ error });
		});
		promises.push(promise);
	}

	Promise.all(promises).then(callback);
});

const save = (index, property, universe, payload, cb) => {
	// remove the one that's in there already
	saver.remove(({ data }) => {
		return data.universe === universe && data.index === index && data.property === property;
	});

	saver.push(payload, cb);
};

const saveDebounced = debounce(save, 1000);

export const setFavorite = (i, isFavorite, universe) => {
	const favorites = [...universe.favorites];
	const position = favorites.indexOf(i);
	if (isFavorite) {
		if (position === -1) favorites.push(i);
	} else {
		if (position !== -1) favorites.splice(position, 1);
	}
	return {
		type: UNIVERSE_SET,
		data: {
			_id: universe._id,
			favorites
		}
	};
};

export const changeInstance = (index, property, value, universeId, dispatch) => {
	const saveFunc = ["name", "desc", "data"].includes(property) ? saveDebounced : save;

	saveFunc(
		index,
		property,
		universeId,
		{ index, property, value, universe: universeId },
		(results = []) => {
			/*results.forEach(result => {
				dispatch({
					type: INSTANCE_SET,
					data: result.array,
					universeId
				});
			});*/
		}
	);

	return {
		type: INSTANCE_SET,
		data: {
			[index]: { [property]: value }
		},
		universeId
	};
};

export const addChild = (universeId, index, child) => {
	DB.create(`/universes/${universeId}/explore/${index}`, child).then(({ error, data = {} }) => {
		if (error) return;
		const instances = {
			[data.current.index]: {
				...data.current,
				in: data.current.in.map(c => c.index),
				up: data.current.up ? data.current.up[0].index : undefined
			}
		};
		data.current.in.forEach(child => {
			instances[child.index] = { ...child, up: index };
		});
		store.dispatch({
			type: INSTANCE_SET,
			data: instances,
			universeId
		});
	});
	return {
		type: INSTANCE_ADD_CHILD,
		index: index,
		data: child,
		universeId
	};
};

const processChunk = (chunk, dispatch, universeId, packUrl) => {
	if (chunk.type === INSTANCE) {
		dispatch({
			type: INSTANCE_SET,
			data: chunk.data,
			universeId: universeId || chunk.meta.universeId
		});
	} else if (chunk.type === UNIVERSE) {
		dispatch({
			type: UNIVERSE_SET,
			data: { ...chunk.data, loaded: true }
		});
	} else if (chunk.type === Pack) {
		dispatch({
			type: SET_PACK,
			data: {
				tempUniverse: chunk.meta.universeId,
				...chunk.data
			},
			id: chunk.data._id
		});
	}
};

const loadCurrent = (dispatch, universe, index, isUniverse, packUrl, isLite) => {
	const notLoaded = isLite || !universe.loaded || !universe.array || !universe.array[index];
	if (notLoaded) {
		let url = isUniverse ? `/universes/${universe._id}/explore` : `/explore/${packUrl}`;
		// don't send me back the whole universe, just the current instances
		if (index !== undefined) url += `/${index}`;
		if (isLite) url += "/lite";

		DB.getNormal(url, c => processChunk(c, dispatch, universe._id, packUrl)).then(
			({ error, data }) => {
				if (error) console.error(error);
			}
		);
	}
	return {
		type: LOAD_EXPLORE,
		universe,
		index
	};
};

export const deleteInstance = (index, universeId, dispatch) => {
	save(
		index,
		"delete",
		universeId,
		{
			index,
			universe: universeId,
			property: "delete",
			value: true
		},
		() => {}
	);
	return {
		type: INSTANCE_DELETE,
		index,
		universeId
	};
};

export { loadCurrent };
