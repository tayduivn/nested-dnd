import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Characters from "../routes/characters/components/Characters";
import GeneratorsList from "containers/GeneratorsList";
import TablesList from "components/TablesList";
import Loading from "components/Loading";
import Tabs from "components/Tabs";
import Link from "components/Link";
import { fetchRebuild } from "store/packs";
import { fetchUniverse, createUniversePack } from "store/universes";
import { generatorsSelect } from "store/generators";

const TABS = ["generators", "tables", "characters"];

const EditUniverseDisplay = ({
	title,
	_id,
	handleSave,
	handleDelete,
	handleCreatePack,
	tab = "generators",
	pack,
	dispatch
}) => (
	<div className="main">
		<div className="mt-5 container">
			<form onSubmit={handleSave}>
				<div className="form-group">
					<label>Title</label>
					<input id="title" name="title" className="form-control" defaultValue={title} />
				</div>
				<button className="btn btn-primary" type="submit">
					Save
				</button>
				&nbsp;&nbsp;
				<button className="btn btn-outline-danger" type="button" onClick={handleDelete}>
					<i className="fas fa-trash" /> Delete
				</button>
			</form>

			{pack.dependencies ? (
				<div>
					<h1>Dependencies</h1>
					{pack.dependencies.map((dep, i) => (
						<Link key={i} to={`/packs/${dep}`}>
							{dep}
						</Link>
					))}
				</div>
			) : null}

			{!pack.universe_id ? (
				<>
					<h2>
						<Link to={`/packs/${pack.url}`}>Pack: {pack.name}</Link>
					</h2>
					<button onClick={handleCreatePack}>Make a universe pack</button>
					<Characters universe_id={_id} />
				</>
			) : (
				<>
					<button onClick={() => fetchRebuild(dispatch, pack._id)}>Rebuild Pack</button>
					<Tabs labels={TABS} active={tab}>
						<GeneratorsList generators={pack.generators} isOwner={true} packUrl={pack.url} />
						<TablesList {...{ tables: pack.tables, packUrl: pack.url }} isOwner={true} />
						<Characters universe_id={_id} />
					</Tabs>
				</>
			)}
		</div>
	</div>
);

const mapStateToProps = (state, ownProps) => {
	const universe = state.universes.byId[ownProps.match.params.universe];
	const pack = universe ? state.packs.byId[universe.pack] : { isFetching: true };

	// TODO: memoize
	let tables = [];
	if (pack && pack.tables) {
		tables = pack.tables.map(t => {
			return state.tables.byId[t] || {};
		});
	}

	return {
		universe,
		pack,
		tables,
		generators: generatorsSelect(state, pack)
	};
};

class EditUniverse extends React.Component {
	static propTypes = {
		match: PropTypes.object.isRequired,
		universe: PropTypes.object,
		pack: PropTypes.object,
		tables: PropTypes.array,
		generators: PropTypes.object
	};
	static defaultProps = {
		universe: {
			isFetching: true
		},
		pack: {
			isFetching: true
		}
	};
	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleCreatePack = this.handleCreatePack.bind(this);
	}
	componentDidMount() {
		this.props.dispatch(fetchUniverse(this.props.match.params.universe));
	}
	componentDidUpdate() {}
	handleSave() {}
	handleDelete() {}
	handleCreatePack() {
		this.props.dispatch(createUniversePack(this.props.match.params.universe));
	}
	render() {
		if (this.props.universe.isFetching) return <Loading.Page />;
		const { handleSave, handleDelete, handleCreatePack } = this;
		const { universe, pack, tables, generators, dispatch } = this.props;
		return (
			<EditUniverseDisplay
				{...{
					...universe,
					pack: { ...pack, tables, generators },
					handleSave,
					handleDelete,
					handleCreatePack,
					dispatch
				}}
			/>
		);
	}
}

export default connect(mapStateToProps)(EditUniverse);
