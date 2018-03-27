import React from 'react';

import StyleTab from './StyleTab'
import EditableInput from './EditableInput'
import ContainsList from './ContainsList';

const namegenHelpText = (
	<ul>
		<li>["option 1","option 2"] to choose randomly</li>
		<li>*TABLE NAME* to roll on a table</li>
		<li>Use | to join parts together. For example, "*NAME*| the baker" would render as "John the baker"</li>
	</ul>
)

const ThingFunctions = ({ b4Make, afMake, b4Render }) => (
	<div>
		<ThingFunc func={b4Make} label="beforeMake" {...funcToString(b4Make)} />
		<ThingFunc func={afMake} label="afterMake" {...funcToString(afMake)} />
		<ThingFunc func={b4Render} label="beforeRender" {...funcToString(b4Render)} />
	</div>
);

const ThingFunc = ({func, label, str, rows}) => (
	<div className={`form-group ${(func) ? "" : "hidden"}`}>
		<label>{label}() - Edit in *.js pack file</label>
		<textarea value={str} rows={rows} disabled />
	</div>
);

const Display = ({props, key, handleSelect}) => (
	<div className="nav nav-tabs" activekey={key} onSelect={handleSelect} id="controlled-tab-example"
		mountonenter="true">
		<div className="nav-item" eventkey={1} title="Style">
			<StyleTab {...props} />
		</div>
		<div className="nav-item" eventkey={2} title="Name Generator">
			<EditableInput  {...props} label="Name generator" property="namegen" value={valToString(props.thing.namegen)} 
				status={props.getStatus("namegen")} defaultHelpText={namegenHelpText} />
		</div>
		<div className="nav-item" eventkey={3} title="Contains">
			<ContainsList 
				list={(props.thing.contains) ? [...props.thing.contains] : []} 
				{...props} status={props.getStatus("contains")} />
		</div>
		<div className="nav-item" eventkey={4} title="Advanced">
			<EditableInput  {...props} label="Data (JSON format)" property="data" value={valToString(props.thing.data)} 
				status={props.getStatus("data")} isJSON={true} />
			<ThingFunctions {...props.thing} />
		</div>
	</div>
);

function funcToString(func){
	if(!func) return { rows: 1, value: "" };

	var str = func.toString().replace(/\t/g, '  ');
	return {
		str: str,
		rows: str.split(/\r\n|\r|\n/).length
	}
}

// values are only converted to arrays and object on save, so this safe to run every time
function valToString(value){
	if(value === undefined || value === false)
		return "";
	if(value.constructor.name === "Array") 
		return value.length ? JSON.stringify(value, null, 2) : ""
	if(typeof value === "object"){
		return Object.keys(value).length ? JSON.stringify(value, null, 2) : ""
	}
	return value;
}

export default class CategoryTabs extends React.Component{
	constructor() {
		super();
		this.state = {
			key: 1
		};
		this.handleSelect = this.handleSelect.bind(this);
	}

	handleSelect(key) {
		this.setState({key});
	}

	render() {
		return <Display props={this.props} key={this.state.key} handleSelect={this.handleSelect} />
	}
};
