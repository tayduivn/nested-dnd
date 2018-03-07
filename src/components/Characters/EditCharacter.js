import React, { Component } from "react";
import {
	Row,
	Col,
	FormControl,
	FormGroup,
	ControlLabel,
	HelpBlock,
	Button,
	Popover,
	OverlayTrigger,
	DropdownButton,
	MenuItem
} from "react-bootstrap";
import PropTypes from "prop-types";

import classStore, {
	raceStore,
	backgroundStore
} from "../../stores/classStore";
import ClassInfo from "./ClassInfo";
import Character from "../../stores/Character";

const alignments = [
	"Lawful Good",
	"Neutral Good",
	"Chaotic Good",
	"Lawful Neutral",
	"True Neutral",
	"Chaotic Neutral",
	"Lawful Evil",
	"Neutral Evil",
	"Chaotic Evil"
];

const backpacks = {
	Blank: "",
	"Scholar's pack": "book of lore, quill & ink bottle, parchment (10 sheets), little bag of sand, small knife".split(
		", "
	),
	"Explorer's pack": "bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, hempen rope (50 ft)".split(
		", "
	),
	"Dungeoneer's pack": "crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days rations, waterskin, hempen rope (50 ft)".split(
		", "
	),
	"Entertainer's pack": "bedroll, 2 costumes, 5 candles, rations (5 days), water skin, hempen rope (50 ft)".split(
		", "
	)
};

function FieldGroup({ id, label, help, ...props }) {
	return (
		<FormGroup controlId={id}>
			<ControlLabel>
				{label}
			</ControlLabel>
			<FormControl {...props} />
			{help &&
				<HelpBlock>
					{help}
				</HelpBlock>}
		</FormGroup>
	);
}

export default class EditCharacter extends Component {
	static get propTypes() {
		return {
			// this is the raw data of the character, NOT the object
			character: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
		};
	}
	static get defaultProps() {
		return {
			character: false
		};
	}
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleAddClass = this.handleAddClass.bind(this);
	}
	handleChange(e) {
		var data = Object.assign({}, this.props.character);
		var value =
			e.target.type === "number"
				? parseInt(e.target.value, 10)
				: e.target.value;
		if (value === undefined) {
			value = e.target.getAttribute("value");
			if (value === "[object Object]") value = {};
		}
		if (e.target.name === "data") {
			try {
				data = JSON.parse(e.target.value);
			} catch (e) {
				// do nothing
			}
		} else {
			var lookup = e.target.name.split(".");
			var doRename = lookup[lookup.length - 1] === "RENAME";
			var doRemove = lookup[lookup.length - 1] === "REMOVE";
			var current = data ? data : {};
			if (doRename || doRemove) lookup.splice(lookup.length - 1, 1);

			// find the place in the raw data to put the value
			lookup.forEach((name, i) => {
				if (current === undefined) return;

				if (i < lookup.length - 1) {
					// not defined in the data object
					if (current[name] === undefined) {
						current[name] = value;
					} else current = current[name];
				} else {
					if (doRename) {
						current[value] = current[name];
						delete current[name];
					} else if (doRemove) {
						if (current.splice) {
							current.splice(name, 1);
						} else {
							delete current[name];
						}
					} else current[name] = value;
				}
			});
		}

		this.props.handleChange(this.props.index, data);
	}
	handleAddClass() {
		var data = Object.assign({}, this.props.character);
		data.classes.push({
			level: 1,
			subclasses: {}
		});
		this.props.handleChange(this.props.index, data);
	}
	render() {
		let c = this.props.character;
		if (!c) return null;

		return (
			<form>
				<FieldGroup
					id="name"
					label="Name"
					value={c.name}
					name="name"
					onChange={this.handleChange}
				/>
				<FormGroup controlId="race">
					<ControlLabel>Race</ControlLabel>
					<FormControl
						componentClass="select"
						name="race"
						value={c.race ? c.race.name : null}
						onChange={this.handleChange}
					>
						<option value="" />
						{raceStore.getOptions().map((o, i) =>
							<option key={i} value={o.value}>
								{o.label}
							</option>
						)}
					</FormControl>
				</FormGroup>

				<h3>Classes</h3>
				<Row>
					<Col lg={3} md={3}>
						<ControlLabel>Class</ControlLabel>
					</Col>
					<Col lg={1} md={2} sm={2}>
						<ControlLabel>Level</ControlLabel>
					</Col>
					<Col lg={2} md={3}>
						<ControlLabel>Display Name</ControlLabel>
					</Col>
					<Col lg={6}>
						<ControlLabel>Subclasses</ControlLabel>
					</Col>
				</Row>
				{c.classes.map((cl, i) =>
					<ClassInfo
						key={i}
						{...cl}
						index={i}
						count={c.classes.length}
						handleChange={this.handleChange}
					/>
				)}
				<Button onClick={this.handleAddClass}>
					<i className="fa fa-plus" /> Add Class
				</Button>

				<Equipment
					{...c.equipment}
					character={c}
					handleChange={this.handleChange}
				/>

				<Body {...c.body} handleChange={this.handleChange} />

				<Background
					{...c.background}
					handleChange={this.handleChange}
				/>

				<FormControl
					rows="30"
					componentClass="textarea"
					value={JSON.stringify(c, null, 2)}
					name="data"
					onChange={this.handleChange}
				/>
			</form>
		);
	}
}

class Equipment extends Component {
	static get propTypes() {
		return {
			character: PropTypes.object.isRequired,
			containers: PropTypes.array
		};
	}
	static get defaultProps() {
		return {
			character: false,
			containers: []
		};
	}
	constructor(props) {
		super(props);
		this.handleChangeContent = this.handleChangeContent.bind(this);
	}
	getNote(obj) {
		return (
			<p key={obj.name}>
				<strong>
					{obj.name}
				</strong>
				<br />
				{obj.equipment.map((n, i) =>
					<span key={i}>
						{n}
						<br />
					</span>
				)}
			</p>
		);
	}
	getNotesOverlay(character = new Character()) {
		var notes = character.equipment && character.equipment.notes
			? character.equipment.notes.map((n, i) =>
					<p key={i}>
						{n}
					</p>
				)
			: [];
		var level1Class = classStore.get(character.classes[0].name);
		var background = character.background
			? backgroundStore.get(character.background.name)
			: null;

		if (level1Class) notes.push(this.getNote(level1Class));
		if (background && background.equipment) {
			notes.push(this.getNote(background));
		}

		return (
			<Popover id="equipment-notes" title="Notes">
				{notes}
			</Popover>
		);
	}
	handleChangeContent(e) {
		var event = {
			target: {
				name: e.target.name,
				value: e.target.value.split(", ")
			}
		};
		this.props.handleChange(event);
	}
	renderContainer(c, i) {
		if (!c) {
			c = {
				name: "",
				content: []
			};
		}

		return (
			<div key={i} className="container-pack">
				<FormControl
					name={"equipment.containers." + i + ".name"}
					value={c.name}
					onChange={this.props.handleChange}
					placeholder="Name"
				/>
				<FormControl
					name={"equipment.containers." + i + ".content"}
					value={c.content ? c.content.join(", ") : c.content}
					onChange={this.handleChangeContent}
					placeholder="Content"
					componentClass="textarea"
					rows="2"
				/>
			</div>
		);
	}
	renderContainerOption(name, content, index) {
		const obj = {
			target: {
				name: "equipment.containers." + index,
				value: {
					name: name ? name : "Backpack",
					content: content ? content : ""
				}
			}
		};
		return (
			<MenuItem
				key={name}
				eventKey={name}
				onClick={() => {
					this.props.handleChange(obj);
				}}
			>
				{name}
			</MenuItem>
		);
	}
	render() {
		return (
			<div>
				<h3>
					Equipment&nbsp;&nbsp;
					<OverlayTrigger
						trigger="click"
						rootClose
						placement="bottom"
						overlay={this.getNotesOverlay(this.props.character)}
					>
						<Button>Notes</Button>
					</OverlayTrigger>
				</h3>

				<FieldGroup
					id="armor"
					label="Armor"
					value={this.props.armor}
					name="equipment.armor"
					onChange={this.props.handleChange}
				/>
				<FieldGroup
					id="weapons"
					label="Weapons"
					value={this.props.weapons}
					name="equipment.weapons"
					onChange={this.props.handleChange}
				/>
				<ControlLabel>Containers</ControlLabel>
				{this.props.containers
					? this.props.containers.map((c, i) =>
							this.renderContainer(c, i)
						)
					: ""}
				<DropdownButton
					id="addContainer"
					title={
						<span>
							<i className="fa fa-plus" /> Add Container
						</span>
					}
				>
					{Object.keys(backpacks).map(name =>
						this.renderContainerOption(
							name,
							backpacks[name],
							this.props.containers.length
						)
					)}
				</DropdownButton>
			</div>
		);
	}
}

class Background extends Component {
	render() {
		return (
			<div>
				<h3>Background</h3>
				<Row>
					<Col md={4}>
						<FormGroup controlId="background">
							<ControlLabel>Background</ControlLabel>
							<FormControl
								componentClass="select"
								name="background.name"
								value={this.props.name}
								onChange={this.props.handleChange}
							>
								{backgroundStore.getNames().map((str, i) =>
									<option key={i} value={str}>
										{str}
									</option>
								)}
							</FormControl>
						</FormGroup>
					</Col>
					<Col md={4}>
						<FieldGroup
							id="specialty"
							label="Background Specialty"
							value={this.props.specialty}
							name="background.specialty"
							onChange={this.props.handleChange}
						/>
					</Col>
					<Col md={4}>
						<FormGroup controlId="alignment">
							<ControlLabel>Alignment</ControlLabel>
							<FormControl
								componentClass="select"
								name="background.alignment"
								value={this.props.alignment}
								onChange={this.props.handleChange}
							>
								{alignments.map((str, i) =>
									<option key={i} value={str}>
										{str}
									</option>
								)}
							</FormControl>
						</FormGroup>
					</Col>
				</Row>
				<FieldGroup
					id="feature"
					componentClass="textarea"
					label="Personality"
					value={this.props.feature}
					name="background.feature"
					onChange={this.props.handleChange}
				/>
				<FieldGroup
					id="personality"
					componentClass="textarea"
					label="Personality"
					value={this.props.personality}
					name="background.personality"
					onChange={this.props.handleChange}
				/>
				<FieldGroup
					id="ideal"
					componentClass="textarea"
					label="Ideal"
					value={this.props.ideal}
					name="background.ideal"
					onChange={this.props.handleChange}
				/>
				<FieldGroup
					id="bond"
					componentClass="textarea"
					label="Bond"
					value={this.props.bond}
					name="background.bond"
					onChange={this.props.handleChange}
				/>
				<FieldGroup
					id="flaw"
					componentClass="textarea"
					label="Flaw"
					value={this.props.flaw}
					name="background.flaw"
					onChange={this.props.handleChange}
				/>
			</div>
		);
	}
}

class Body extends Component {
	render() {
		return (
			<div>
				<h3>Body</h3>
				<Row>
					<Col md={4}>
						<FieldGroup
							id="age"
							type="number"
							label="Age"
							value={this.props.age}
							name="body.age"
							onChange={this.props.handleChange}
						/>
					</Col>
					<Col md={4}>
						<FieldGroup
							id="height"
							label="Height"
							value={this.props.height}
							name="body.height"
							onChange={this.props.handleChange}
						/>
					</Col>
					<Col md={4}>
						<FieldGroup
							id="weight"
							label="Weight"
							value={this.props.weight}
							name="body.weight"
							onChange={this.props.handleChange}
						/>
					</Col>
				</Row>
				<Row>
					<Col md={4}>
						<FieldGroup
							id="eyes"
							label="Eye Color"
							value={this.props.eyes}
							name="body.eyes"
							onChange={this.props.handleChange}
						/>
					</Col>
					<Col md={4}>
						<FieldGroup
							id="skin"
							label="Skin Color"
							value={this.props.skin}
							name="body.skin"
							onChange={this.props.handleChange}
						/>
					</Col>
					<Col md={4}>
						<FieldGroup
							id="hair"
							label="Hair"
							value={this.props.hair}
							name="body.hair"
							onChange={this.props.handleChange}
						/>
					</Col>
				</Row>
			</div>
		);
	}
}
