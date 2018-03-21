import React from "react";

const DEBUG = false;

class NewThingForm extends React.Component {
	constructor() {
		super();
		this.state = {
			name: "",
			validationState: null,
			helpText: ""
		};
		this.createNewThing = this.createNewThing.bind(this);
	}
	createNewThing() {
		this.props.addThing();
		this.setState({
			name: "",
			validationState: null,
			helpText: ""
		});
	}
	render() {
		return (
			<div id="newThingButton" className="col-sm-3 col-md-2">
				<button className="btn btn-circle btn-primary btn-lg"
					onClick={this.createNewThing}
					disabled={this.state.validationState === "error"}
				>
					<i className="fa fa-plus" />
				</button>
			</div>
		);
	}
}

function ThingChoices(props) {
	if (!props.things || !props.things.length) {
		return <div />;
	}
	if (DEBUG)
		console.log("----- ThingChoices RENDER : " + props.things.length);
	const things = props.things.map(name =>
		<ThingChoice
			key={name}
			name={name}
			selected={name === props.currentThingName}
			currentIsa={
				name === props.currentThingName ? props.currentThing.isa : null
			}
			currentIcon={
				name === props.currentThingName ? props.currentThing.icon : null
			}
			selectFunc={props.selectFunc}
		/>
	);

	return (
		<div>
			<ul className="list-group">
				{things}
			</ul>
			<NewThingForm addThing={props.saveThing} />
		</div>
	);
}

class ThingChoice extends React.Component {
	constructor() {
		super();
		this.handleClick = this.handleClick.bind(this);
	}
	shouldComponentUpdate(nextProps) {
		return !Object.values(this.props).equals(Object.values(nextProps));
	}
	handleClick() {
		this.props.selectFunc(this.props.name);
	}
	render() {
		// if (!thingStore.exists(this.props.name)) return <div />;

		const t =  {} //thingStore.get(this.props.name);
		const icon = ''; //t.getIcon();
		const name = this.props.name.trim().length
			? this.props.name
			: <em>new thing</em>;
		const isa = t.isa && t.isa.join ? t.isa.join(", ") : t.isa;

		return (
			<li className="list-group-item"
				id={encodeURIComponent(this.props.name)}
				active={this.props.selected.toString()}
				onClick={this.handleClick}
			>
				<h4 className="m-0">
					<i className={icon} /> {name}
				</h4>
				{isa}
			</li>
		);
	}
}

export default ThingChoices;

export { NewThingForm };
