const generators = require("__fixtures__/generators");
const Maker = require("../make");
const BuiltPack = require("builtpack/BuiltPack");

test("makes styles", () => {
	const result = new Maker({ builtpack: new BuiltPack() }).make(generators.tavern, 0);
	expect(result.txt).toBe("brown");
	expect(result.cls).toBe("bg-wood-200 ptn-purty-wood");
	expect(result.icon.kind).toBe("icon");
	expect(result.icon.value).toBe("svg game-icons/lorc/beer-stein");
});
