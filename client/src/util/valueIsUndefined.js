// essentially makes up for the default values when constructing a thing
// need to know if value should be unset (set to undefined) in pack
export default function valueIsUndefined(value) {
	return value === undefined || value === false
		? true
		: value === null
		? false // null means overwrite other packs to set this blank, or ignore isa value
		: typeof value === "string"
		? value === ""
		: value.constructor && value.constructor.name === "Array"
		? value.equals([])
		: !Object.keys(value).length;
}
