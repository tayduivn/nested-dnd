// todo: memoize
export function generatorsSelect(state, pack) {
	let generators = {};
	if (pack && pack.originalGen) {
		pack.originalGen.forEach(id => {
			const gen = state.generators.byId[id];
			if (gen) generators[gen.isa] = gen;
		});
	}
	return generators;
}

export function availableGeneratorsSelect(state, pack) {
	if (pack && pack.generators) {
		return Object.keys(pack.generators);
	}
}
