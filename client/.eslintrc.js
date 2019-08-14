var techdebt = require("../.eslint-techdebt");

const config = {
	extends: ["eslint:recommended", "react-app"],
	root: true,
	env: {
		browser: true,
		es6: true
	},
	parserOptions: {
		ecmaVersion: 6,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
			modules: true,
			experimentalObjectRestSpread: true
		}
	},
	rules: {
		"no-process-env": 0,
		"react/prop-types": "off",
		"no-console": "off",
		"no-case-declarations": "off",
		"max-lines-per-function": "off"
	},
	overrides: [
		{
			files: ["*.test.js"],
			env: {
				mocha: true
			},
			rules: {
				"max-lines-per-function": "off"
			}
		}
	]
};

config.rules = Object.assign({}, techdebt, config.rules);

module.exports = config;
