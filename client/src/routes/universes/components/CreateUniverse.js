import React, { Component } from "react";

import PackUL from "components/PackUL";
import getQueryParams from "util/getQueryParams";

const Display = ({ packs, onSelectPack, selectedPack, handleAdd }) => (
	<div>
		<h1>Create universe</h1>
		<PackUL list={packs} selectable={true} onSelect={onSelectPack} selected={selectedPack} />
		{selectedPack ? (
			<form
				className="form-group mt-4 mb-3"
				onSubmit={e => {
					handleAdd(e, selectedPack);
				}}
			>
				<label>Name your universe...</label>
				<input
					name="title"
					className="form-control form-control-lg"
					defaultValue={packs.find(p => p._id === selectedPack).name + " Universe"}
					required
				/>
				<button type="submit" className="mt-3 btn btn-lg btn-primary">
					Create <i className="fas fa-chevron-right" />
				</button>
			</form>
		) : null}
	</div>
);

export default class CreateUniverse extends Component {
	constructor() {
		super();
		this.onSelectPack = this.onSelectPack.bind(this);

		this.state = {
			selectedPack: undefined
		};
	}

	componentDidMount() {
		this.setState({ selectedPack: getQueryParams(this.props.location).pack });
	}

	onSelectPack(event) {
		this.setState({ selectedPack: event.currentTarget.id });
	}

	/**
	 * TODO: display loading for packs if undefined
	 */
	render() {
		return (
			<div className="main">
				<div className="container mt-5">
					<Display
						packs={appendBlank(this.props.packs.myPacks)}
						selectedPack={this.state.selectedPack}
						onSelectPack={this.onSelectPack}
						onSubmit={this.onSubmit}
						handleAdd={this.props.handleAdd}
					/>
				</div>
			</div>
		);
	}
}

function appendBlank(packs) {
	const nested = {
		_id: "5aa2f8c11e0a791ed4d0a547",
		name: "Nested",
		_user: "5aa2f8a31e0a791ed4d0a546",
		url: "nested",
		font: "Press Start 2P",
		cls: "black stardust",
		txt: "white"
	};

	const dnd = {
		_id: "5aac89021d9de21d4c482c35",
		name: "Dungeons & Dragons",
		url: "dnd",
		_user: "5aa2f8a31e0a791ed4d0a546",
		font: "IM Fell English SC",
		cls: "burlywood purty-wood",
		txt: "brown"
	};

	if (!packs.find(p => p._id === nested._id)) packs.push(nested);

	if (!packs.find(p => p._id === dnd._id)) packs.push(dnd);

	return packs.concat([
		{
			name: "Blank",
			_id: "BLANK",
			txt: "black",
			cls: "white",
			description: "Start fresh with an empty universe"
		}
	]);
}
