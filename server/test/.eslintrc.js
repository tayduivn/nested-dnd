module.exports = {
	extends: ["eslint:recommended", "plugin:node/recommended"],
	plugins: ["node"],
	env: {
		node: true,
		es6: true,
		mocha: true
	},
	globals: {
		app: true
	},
	ecmaFeatures: {
		blockBindings: true
	},
	rules: {
		indent: [
			"error",
			"tab",
			{
				SwitchCase: 1
			}
		],
		eqeqeq: ["warn", "always"],
		radix: ["warn", "always"],
		"array-callback-return": ["warn"],
		"no-console": "off",
		"no-process-env": "off",
		"no-extend-native": [
			2,
			{
				exceptions: ["Array"]
			}
		],
		"node/no-unpublished-require": "off",
		"no-case-declarations": "off"
	}
};
