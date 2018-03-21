import React from 'react';

import StyleTab from './StyleTab'
import EditableInput from './EditableInput'
import ContainsList from './ContainsList';

const namegenHelpText = (<ul>
	<li>["option 1","option 2"] to choose randomly</li>
	<li>*TABLE NAME* to roll on a table</li>
	<li>Use | to join parts together. For example, "*NAME*| the baker" would render as "John the baker"</li>
</ul>)
const DEBUG = false;

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

	// values are only converted to arrays and object on save, so this safe to run every time.
	_valToString(value){
		if(value === undefined || value === false)
			return "";
		if(value.constructor.name === "Array") 
			return value.length ? JSON.stringify(value, null, 2) : ""
		if(typeof value === "object"){
			return Object.keys(value).length ? JSON.stringify(value, null, 2) : ""
		}
		return value;
	}

	render() {
		if(DEBUG) console.log("------ CategoryTabs RENDER");

		const namegenStatus = this.props.getStatus("namegen");
		const dataStaus = this.props.getStatus("data");
		const containsStatus = this.props.getStatus("contains");

		const data = this._valToString(this.props.thing.data);
		const namegen = this._valToString(this.props.thing.namegen);
		const contains = (this.props.thing.contains) ? [...this.props.thing.contains] : [];

		return (
			<div className="nav nav-tabs" activekey={this.state.key} onSelect={this.handleSelect} id="controlled-tab-example"
				mountonenter="true">
				<div className="nav-item" eventkey={1} title="Style">
					<StyleTab {...this.props} />
				</div>
				<div className="nav-item" eventkey={2} title="Name Generator">
					<EditableInput  {...this.props} label="Name generator" property="namegen" value={namegen} 
						status={namegenStatus} defaultHelpText={namegenHelpText} />
				</div>
				<div className="nav-item" eventkey={3} title="Contains">
					<ContainsList list={contains} {...this.props} status={containsStatus} />
				</div>
				<div className="nav-item" eventkey={4} title="Advanced">
					<EditableInput  {...this.props} label="Data (JSON format)" property="data" value={data} 
						status={dataStaus} isJSON={true} />
					<ThingFunctions thing={this.props.thing} />
				</div>
			</div>
		);
	}
};

function ThingFunctions (props) {
	function funcToString(func){
		if(!func) return { rows: 1, value: "" };

		var str = func.toString().replace(/\t/g, '  ');
		return {
			str: str,
			rows: str.split(/\r\n|\r|\n/).length
		}
	}
	const f1 = funcToString(props.thing.b4Make);
	const f2 = funcToString(props.thing.afMake);
	const f3 = funcToString(props.thing.b4Render);

	return (<div>
		
		<div className={`form-group ${(props.thing.b4Make) ? "" : "hidden"}`} validationstate="warning">
			<label>beforeMake() - Edit in *.js pack file</label>
			<textarea value={f1.str} rows={f1.rows} disabled />
		</div>
		<div className={`form-group ${(props.thing.afMake) ? "" : "hidden"}`} validationstate="warning">
			<label>afterMake() - Edit in *.js pack file</label>
			<textarea value={f2.str} rows={f3.rows} disabled />
		</div>
		<div className={`form-group ${(props.thing.b4Render) ? "" : "hidden"}`} validationstate="warning">
			<label>beforeRender() - Edit in *.js pack file</label>
			<textarea value={f3.str} rows={f3.rows} disabled />
		</div>
	</div>);
}