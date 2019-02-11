module.exports = {
	"no-useless-call": "error",
	"max-lines": [
		"warn",
		{
			max: 250,
			skipBlankLines: true,
			skipComments: true
		}
	],
	complexity: ["warn", 10],
	"max-depth": ["warn", 4],
	"max-statements": ["warn", 20],
	"max-lines-per-function": [
		"warn",
		{
			max: 30,
			skipBlankLines: true,
			skipComments: true
		}
	],
	"max-nested-callbacks": ["warn", 4],
	"max-params": ["warn", 6]
};
