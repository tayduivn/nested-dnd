import React, { Component } from "react";
import { Row, Col, FormControl, Button } from "react-bootstrap";
import Select, { Creatable } from "react-select";

import classStore from "../../stores/classStore";

export default class ClassInfo extends Component {
	constructor(props) {
		super(props);
		this.handleAddSubclass = this.handleAddSubclass.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
		this.getSubclasses = this.getSubclasses.bind(this);
	}
	handleRemove() {
		this.props.handleChange({
			target: {
				name: "classes." + this.props.index + ".REMOVE",
				value: ""
			}
		});
	}
	getSubclasses() {
		return Object.keys(classStore.get(this.props.name).subclasses);
	}
	handleAddSubclass() {
		this.props.handleChange({
			target: {
				name: "classes." + this.props.index + ".subclasses.",
				value: { "": "" }
			}
		});
	}
	renderSubclasses(subclasses, prefix) {
		var names = subclasses ? Object.keys(subclasses).sort() : [];
		var _this = this;
		return names.map(function(name) {
			return (
				<Subclass
					getSubclasses={_this.getSubclasses}
					key={name}
					name={name}
					subclass={subclasses[name]}
					class={_this.props.name}
					prefix={prefix}
					handleChange={_this.props.handleChange}
				/>
			);
		});
	}
	render() {
		const prefix = "classes." + this.props.index + ".";
		const subclasses = this.props.subclasses ? this.props.subclasses : {};
		return (
			<Row>
				<Col lg={3} md={3}>
					<div
						className={
							this.props.count < 2 ? "" : "left-delete-btn"
						}
					>
						<Button
							className={
								"delete-btn " +
								(this.props.count < 2 ? "hidden" : "")
							}
							data-index={this.props.index}
							data-value={this.props.value}
							onClick={this.handleRemove}
						>
							<span>
								<i className="fa fa-trash" />
							</span>
						</Button>
						<FormControl
							componentClass="select"
							name={prefix + "name"}
							value={this.props.name}
							onChange={this.props.handleChange}
						>
							<option />
							{classStore.getNames().map((str, i) =>
								<option key={i} value={str}>
									{str}
								</option>
							)}
						</FormControl>
					</div>
				</Col>
				<Col lg={1} md={2} sm={2}>
					<FormControl
						min="1"
						max="20"
						type="number"
						name={prefix + "level"}
						value={this.props.level}
						onChange={this.props.handleChange}
					/>
				</Col>
				<Col lg={2} md={3}>
					<FormControl
						name={prefix + "label"}
						value={this.props.label}
						onChange={this.props.handleChange}
					/>
				</Col>
				<Col lg={6}>
					{this.renderSubclasses(subclasses, prefix + "subclasses.")}
					<div
						className={
							this.getSubclasses().length >
							Object.keys(subclasses).length
								? "left-delete-btn"
								: "hidden"
						}
					>
						<Button bsSize="sm" onClick={this.handleAddSubclass}>
							<i className="fa fa-plus" /> Add {this.props.name}{" "}
							Subclass
						</Button>
					</div>
				</Col>
			</Row>
		);
	}
}

class Subclass extends Component {
	constructor(props) {
		super(props);
		this.handleChangeMultiselect = this.handleChangeMultiselect.bind(this);
		this.handleRemoveSubclass = this.handleRemoveSubclass.bind(this);
	}
	handleChangeMultiselect(value) {
		this.props.handleChange({
			target: {
				name: this.props.prefix + this.props.name,
				value: value
			}
		});
	}
	handleRemoveSubclass() {
		this.props.handleChange({
			target: {
				name: this.props.prefix + this.props.name + ".REMOVE",
				value: ""
			}
		});
	}
	getChoices() {
		var subclass = classStore.get(this.props.class).subclasses[
			this.props.name
		];

		if (!subclass) return [];

		return classStore
			.get(this.props.class)
			.subclasses[this.props.name].map(o => {
				return {
					value: o,
					label: o
				};
			});
	}
	getSubclassOptions() {
		return [{}].concat(
			this.props
				.getSubclasses()
				.map(name => ({ value: name, label: name }))
		);
	}
	render() {
		return (
			<Row>
				<Col xs={6}>
					<div className="left-delete-btn">
						<Button
							className="delete-btn"
							data-index={this.props.index}
							data-value={this.props.value}
							onClick={this.handleRemoveSubclass}
						>
							<span>
								<i className="fa fa-trash" />
							</span>
						</Button>
						<Creatable
							name={
								this.props.prefix + this.props.name + ".RENAME"
							}
							simpleValue
							value={this.props.name}
							options={this.getSubclassOptions()}
							onChange={this.props.handleChange}
						/>
					</div>
				</Col>
				<Col xs={6}>
					<Select
						simpleValue
						multi={true}
						value={this.props.subclass}
						options={this.getChoices()}
						onChange={this.handleChangeMultiselect}
					/>
				</Col>
			</Row>
		);
	}
}
