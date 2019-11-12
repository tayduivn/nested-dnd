import React, { Component } from "react";
import PropType from "prop-types";
import { Link } from "react-router-dom";
import async from "async";
import debounce from "debounce";

import DB from "util/DB";
import { LoadingIcon } from "../Util/Loading";

export class ViewGenerator extends Component {
	render() {
		const { built: gen, packUrl } = this.props;
		const isa = gen.isa;

		if (!gen) return null;

		return (
			<div className="main">
				<div className="container mt-5">
					{!gen.isLoaded ? <LoadingIcon /> : null}
					<Link to={"/packs/" + packUrl}>⬑ Pack</Link>
					<h1>{isa}</h1>

					{/* --------- Edit Button ------------ */}
					{this.props.loggedIn ? (
						<Link to={"/packs/" + packUrl + "/generators/" + isa + "/edit"}>
							<button className="btn btn-primary">Edit Generator</button>
						</Link>
					) : null}

					<ul>
						{Object.keys(gen).map((k, i) => {
							return (
								<li key={i}>
									<strong>{k}</strong>:{" "}
									{gen[k] instanceof Object ? <pre>{JSON.stringify(gen[k], null, 2)}</pre> : gen[k]}
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}
}

export default class Generator extends Component {
	static propTypes = {
		match: PropType.object,
		pack: PropType.object,
		handleRenameGen: PropType.func,
		tables: PropType.array
	};

	static defaultProps = {
		handleRenameGen: () => {}
	};

	state = {
		generator: null,
		error: null
	};

	constructor(props) {
		super(props);
		this.debouncedChange = debounce(this.debouncedChange.bind(this), 1000);
	}

	saver = async.cargo((tasks, callback) => {
		//combine tasks
		var newValues = {};
		const { pack } = this.props.match.params;
		const { built = {}, unbuilt = {} } = this.state.generator || {};
		const _id = built._id || unbuilt._id;

		tasks.forEach(t => {
			if (!t.property) return;
			newValues[t.property] = t.value;
		});

		DB.set("packs/" + pack + "/generators", _id, newValues).then(({ error, data }) => {
			if (error) this.setState({ generator: data, error });
			callback();
		});
	});

	componentDidMount() {
		const { pack: pack_id, generator: isa } = this.props.match.params;

		if (isa) {
			DB.get("packs/" + pack_id + "/generators", isa).then(({ error, data }) => {
				this.setState({ generator: data, error: error });
			});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		var { generator = { built: {} } } = this.state;
		if (!generator) generator = { built: {} };
		if (!generator.built) generator.built = {};

		/*const urlChanged = this.props.match.params.generator !== prevProps.match.params.generator;
		const isaDifferentThanSaved = this.props.match.params.generator !== generator.built.isa;
		if (urlChanged && isaDifferentThanSaved) {
		}*/
	}

	handleDelete = () => {
		const { pack, generator } = this.props.match.params;

		DB.delete("packs/" + pack + "/generators", this.state.generator.unbuilt._id).then(
			({ error, data }) => {
				if (error) return this.setState({ error });
				this.props.handleRenameGen(generator, null);
				this.props.history.push("/packs/" + pack);
			}
		);
	};

	debouncedChange = (property, value) => {
		this.handleChange(property, value);
	};

	handleChange = (property, value) => {
		this.saver.push(
			{
				property: property,
				value: value
			},
			() => {
				if (property === "isa") {
					const { pack, generator } = this.props.match.params;
					var newUrl =
						this.props.match.path.replace(":pack", pack).replace(":generator", value) + "/edit";
					this.props.history.replace(newUrl);
					this.props.handleRenameGen(generator, value);
				}
			}
		);
	};

	render() {
		const { match } = this.props;
		const { generator, error } = this.state;

		var content;
		if (error) content = error.display;
		else if (!generator && match.params.generator) content = LoadingIcon;
		else {
			content = <ViewGenerator {...generator} />;
		}

		return { content };
	}
}
