import React, { Component } from "react";
import PropTypes from "prop-types";
import debounce from "debounce";
import { connect } from "react-redux";

import Page from "components/Page";
import EditTableDisplay from "../components/EditTableDisplay";
import { TitleInput } from "components/Form";
import { Loading, Link } from "components";
import EditGeneratorDisplay from "components/EditGeneratorDisplay";

import { fetchTableIfNeeded, setTable, createTable } from "store/tables/actions";
import { tablePathSelector, embeddedContentSelector } from "store/tables/selectors";
import { fetchPackIfNeeded } from "store/packs/actions";
import { tablesSelect } from "store/tables/selectors/tablePathSelector";

const mapStateToProps = state => {
	const match = tablePathSelector(state);
	console.log("match", match);
	const pack = state.packs.byId[state.packs.byUrl[match.params.pack]];
	const table = state.tables.byId[match.params.table];
	const embedded = table ? embeddedContentSelector(state, table) : undefined;
	return {
		table,
		pack,
		tables: tablesSelect(state, pack),
		isCreate: match.params.table === "create",
		loggedIn: state.user.loggedIn,
		match,
		embedded
	};
};

class Embedded extends React.Component {
	handleChange = data => {
		this.props.handleChange({ rows: { [this.props.index]: { value: data } } });
	};
	render() {
		const { index, generators, tables } = this.props;
		if (this.props.type === "embed") {
			return (
				<>
					<Link to={this.props.up}>up a level</Link>
					<EditGeneratorDisplay
						{...this.props.value}
						{...{ index, generators, tables }}
						isEmbedded={true}
						handleChange={this.handleChange}
					/>
				</>
			);
		} else return null;
	}
}

class EditTable extends Component {
	static propTypes = {
		table: PropTypes.object,
		match: PropTypes.object,
		isEmbedded: PropTypes.bool,
		location: PropTypes.object
	};

	static defaultProps = {
		pack: {
			generators: {}
		},
		table: { isFetching: true },
		handleChange: () => {},
		handleDelete: () => {}
	};

	constructor(props) {
		super(props);
		this.debouncedChange = debounce(this.props.handleChange, 1000);
	}

	componentDidMount() {
		this.props.dispatch(fetchTableIfNeeded(this.props.match.params.table));
		this.props.dispatch(fetchPackIfNeeded(this.props.match.params.pack));
	}

	componentDidUpdate(prevProps) {
		if (prevProps.match.table !== this.props.match.table) {
			this.props.dispatch(fetchTableIfNeeded(this.props.match.params.table));
		}
	}

	handleBulkAdd = () => {
		/*
		var lines = this.state.bulkAddText.split("\n");
		var rows = this.state.rows.concat([]);
		lines.forEach(line => rows.push({ type: "string", value: line }));
		this.handleChange("rows", rows);*/
	};

	handleChange = data => {
		this.props.dispatch(setTable(this.props.match.params.table, data));
	};

	handleChangeEmbedded = () => {};

	handleDelete = () => {
		// if (!this.props.isEmbedded) this.props.handleDelete();
	};

	handleCreate = title => {
		this.props.dispatch(createTable(this.props.match.params.pack, title));
	};

	getTotalWeight = (rows = []) => {
		var totalWeight = 0;
		if (rows.forEach) {
			rows.forEach((r = {}) => (totalWeight += (r && r.weight) || 1));
		}
		return totalWeight;
	};

	render() {
		const { handleChange, handleBulkAdd, handleDelete, handleCreate } = this;
		const { match, isEmbedded, embedded, pack = {}, table, isCreate } = this.props;
		var { tables, generators = {} } = pack;
		const totalWeight = this.getTotalWeight(table.rows);

		if (table.isFetching) return <Loading.Page />;

		return (
			<Page className="EditTable">
				{table.isSaving ? "Saving" : "Saved"}
				{isEmbedded ? (
					<h3>↳ Row {parseInt(match.params.index, 10) + 1}</h3>
				) : (
					<TitleInput
						key={this.props.match.params.table}
						value={table.title}
						name="title"
						placeholder="table title"
						required={true}
						autoFocus={isCreate}
						handleChange={handleChange}
					/>
				)}
				{embedded ? (
					<Embedded {...{ ...embedded, handleChange, generators, tables }} />
				) : (
					<EditTableDisplay
						{...table}
						{...{
							tables,
							generators,
							handleChange,
							handleCreate,
							isCreate,
							isEmbedded,
							totalWeight,
							handleBulkAdd,
							handleDelete
						}}
						location={match.url}
					/>
				)}
			</Page>
		);
	}
}

export default connect(mapStateToProps)(EditTable);
