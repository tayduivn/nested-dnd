import React from "react";

import MixedKeyValue from "components/Form/MixedKeyValue";

const DATA_OPTIONS = {
	property: "data",
	types: ["string", "generator", "table_id", "embed", "json", "table"]
};

const Data = ({ data, generators, tables, handleChange, index }) => (
	<MixedKeyValue
		map={data}
		options={DATA_OPTIONS}
		{...{ generators, tables }}
		handleChange={(prop, val) => handleChange({ [index]: { [prop]: val } })}
	/>
);

export default Data;
