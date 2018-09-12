import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import PropTypes from "prop-types";
import debounce from 'debounce';
import Select from 'react-select';

import { handleNestedPropertyValue } from '../Generators/EditGenerator';
import MixedThing from '../Form/MixedThing'
import { PropsRoute } from '../Routes';

const fng = require('fantasy-names');
var arrayOptions = []

for(var section in fng.generators){
	var s = fng.generators[section];
	for(var i = 0; i < s.length; i++){
		arrayOptions.push({
			label: toLabel(section+' > '+s[i]),
			value: [section, s[i]]
		})
	}
}

function wrapOption(section = '', p = ''){
	return {label: toLabel(section+' > '+p), value: [section, p]}
}

function toLabel(val){
	if(!val) return '';
	return val.replace(/-/g,' ').replace(/_/g,' ');
}

const FNG = ({handleChange, rows}) => (
	<div>
		<Select value={wrapOption(rows[0] && rows[0].value, rows[1] && rows[1].value)} 
			onChange={({ value })=>{
				handleChange(['rows',0,'value'], value[0]);
				handleChange(['rows',1,'value'], value[1]);
			}}
			options={arrayOptions} >
		</Select>
		<select className="form-control" value={rows[2] && rows[2].value}
			onChange={(e)=>handleChange(['rows',2,'value'], e.target.value)}>
			<option></option>
			<option value="0">Male</option>
			<option value="1">Female</option>
		</select>
	</div>
)

const NotFNG = ({type, value, weight, returns, concat, handleChange, generators, tables, rows, _id}) => (
	<MixedThing options={{
			types: (returns === 'generator') 
				? ['generator', 'table_id', 'table', 'data']
				: ['string','table_id','table', 'data','dice'],
			property: ['rows',i],
			showWeight: !concat,
			isTextarea: true
		}} {...{handleChange, value, generators, weight, i}}
		tables={returns === 'generator' 
			? tables.filter(t=>t.returns==='generator' && t._id !== _id)
			: tables.filter(t=>t.returns!=='generator' && t._id !== _id)}
		array={rows}
		type={returns === 'generator' && (!type || type === 'string') ? 'generator' : type } />
)

const ReturnOption = ({ returns, handleChange, type = "" }) => (
	<label className={"form-check btn btn-secondary"+((returns === type)?' active':'')}>
		<input className="form-check-input" type="radio" name="returns" id="returns" value={type} 
			checked={returns === type}
			onChange={e=>handleChange('returns',e.target.value)}/>
		<span className="form-check-label">{type}</span>
	</label>
)

const Returns = (props) => (
	<div className="form-group">
		<label className="mr-2">Returns</label>
		<div className="btn-group">
			<ReturnOption {...props} type="generator" />
			<ReturnOption {...props} type="text" />
			<ReturnOption {...props} type="fng" />
		</div>
	</div>
)

const BulkAdd = ({ handleBulkAdd, bulkAddText, handleChange }) => (
	<div>
		<label className="mr-1">Bulk Add</label>
		<button className="btn btn-primary" onClick={handleBulkAdd}>Bulk Add</button>
		<textarea className="form-control" value={bulkAddText} placeholder="Insert 1 row per line" 
			onChange={(e)=>handleChange('bulkAddText', e.target.value)} />
	</div>
)

const Rows = ({ returns, handleChange, rows, concat, generators, tables, _id }) => (
	<div className="form-group">
		<label>Rows</label>
		<ul className="p-0">
			{returns === 'fng'
				? <FNG {...{handleChange, rows}} />
				: !rows.map ? null : rows.map( (c = {}, i)=>
						<NotFNG key={i} {...c} {...{returns, concat, handleChange, generators, tables, rows, _id}} />)
			}
		</ul>
		<button className="btn btn-primary" onClick={()=>handleChange(['rows',rows.length || 0],{type: 'string'})}>
			<i className="fas fa-plus" /> Add
		</button>
	</div>
)

const DisplayForm = ({_id, desc, returns = 'text', rows = [], roll, tables = [], concat, rowWeights, public: isPublic, source = {}, handleChange, totalWeight, handleDelete, generators, isEmbedded, location, handleBulkAdd, bulkAddText}) => (
	<div>
		{ !isEmbedded ? <Returns {...{returns, handleChange}} /> : null }

		{/* --------- Concatenate ------------ */}
		<div className="form-group">
			<label>
				<input type="checkbox" checked={concat} name="chooseRandom" onChange={(e)=>handleChange('concat', !concat)} /> 
				<strong> Combine Rows:</strong> The rows will combine together (instead of returning 1 random row).
			</label>
		</div>

		{/* --------- Capitalize First ------------ */}
		{returns === 'fng'
			? <div className="form-group">
				<label>
					<input type="checkbox" checked={rows[3] && rows[3].value} name="capitalize" 
						onChange={(e)=>handleChange(['rows', 3, 'value'], e.target.checked)} /> 
					<strong> Capitalize:</strong> The first letter of the result will always be capitalized.
				</label>
			</div>
			: null}

		<Rows {...{ returns, handleChange, rows, concat, generators, tables, _id }} />

		{!concat ? <div>Weights Total = {totalWeight}</div> : null}

		{/* --------- Source ------------ */}
		{ returns !== 'fng' 
			? <div className="form-group">
					<label>Source URL</label>
					<input value={source.url} name="source" className="form-control"
						onChange={(e)=>handleChange(['source', 'url'], e.target.value )} />
				</div>
			: null
		}

		{isEmbedded ? null :	<div>Roll: {typeof roll === 'string' ? roll : (roll && roll.toString) ? roll.toString() : null }</div>}

		{ returns === 'text' ? <BulkAdd {...{handleBulkAdd, bulkAddText, handleChange }} /> : null}

		<div className="btn btn-danger" onClick={handleDelete}>Delete</div>
	</div>
)

const Display = ({isCreate, handleAdd = ()=>{}, title = "", ...rest}) => (
	<div className="form">
		{ isCreate ?
			<button  className="btn btn-primary" onClick={()=>handleAdd(title)} >Create</button> 
			: <DisplayForm {...rest} />
		}
	</div>
);

export default class EditTable extends Component {

	static propTypes = {
		pack: PropTypes.object,
		table: PropTypes.object,
		isCreate: PropTypes.bool,
		match: PropTypes.object,
		isEmbedded: PropTypes.bool,
		location: PropTypes.object,
		handleChange: PropTypes.func,
		handleAdd: PropTypes.func,
		handleDelete: PropTypes.func
	}

	static defaultProps = {
		pack: {
			generators: {}
		},
		table: {},
		handleChange: ()=>{},
		handleAdd: ()=>{},
		handleDelete: ()=>{}
	}

	constructor(props){
		super(props);

		// fully controlled with key
		// set once on load from props and then control
		// will make new EditTable if key={} prop chances
		const t = {...props.table} || {};
		this.state = {
			title: (t.title||"")+"",
			desc: t.desc,
			returns: t.returns,
			rows: t.rows,
			concat: t.concat,
			rowWeights: t.rowWeights,
			tableWeight: t.tableWeight,
			public: t.public,
			source: t.source,
			_id: t._id,
			bulkAddText: ""
		}

		this.debouncedChange = debounce(this.props.handleChange, 1000);
	}

	handleBulkAdd = () =>{
		var lines = this.state.bulkAddText.split('\n');
		var rows = this.state.rows.concat([]);
		lines.forEach(line=>rows.push({type:'string',value:line}));
		this.handleChange('rows',rows);
	}

	handleChange = (prop, val) => {
		var property = prop, value = val;

		this.setState((prevState)=>{

			if(prop instanceof Array){
				var result = handleNestedPropertyValue(prop, val, prevState);
				property = result.property; value = result.value;
			}
			if(property === 'rows'){
				if(!(value instanceof Array))
					value = []; // temporary bandaid to fix bad data
			}

			return {[property]: value}

		}, ()=>{
			if(property === 'bulkAddText') return;

			// TODO: validate
			var isValid = true;

			if(isValid && !this.state.isCreate){

				// nest embedded
				if(this.props.isEmbedded){
					property = ['rows', this.props.match.params.index, 'value', property];
				}

				// debounce typing
				if(['title','value'].includes(prop[prop.length-1]))
					this.debouncedChange(property, value);
				else
					this.props.handleChange(property, value);
			}
		})
		
	}

	handleChangeEmbedded = () => {
		console.log('jey monika')
	}

	handleDelete = () => {
		if(this.props.isEmbedded)
			console.log('test');
		else 
			this.props.handleDelete();
	}

	getTotalWeight = (rows = []) => {
		var totalWeight = 0;
		if(rows.forEach){
			rows.forEach((r={})=>totalWeight+=(r&&r.weight)||1);
		}
		return totalWeight;
	}

	render() {

		const { handleChange, handleBulkAdd, handleDelete } = this;
		const { isCreate, match, isEmbedded, table, handleAdd, pack={} } = this.props;
		const { roll } = table;
		const { table: embeddedTable = {} } = this.props.location.state || {}
		var { generators, tables } = pack;
		const { rows } = this.state;
		const totalWeight = this.getTotalWeight(rows);

		generators = Object.keys(generators);
		embeddedTable.returns = table.returns;

		return (
			<div className="EditTable">
				{ isEmbedded 
					? <h3>↳ Row {parseInt(match.params.index,10)+1}</h3>
					: <input className="input-title input-transparent" name="title" value={this.state.title} 
							placeholder="table title"
							onChange={(e)=>handleChange('title',e.target.value)} required autoFocus={isCreate} /> }
				<Switch>
					<PropsRoute path={match.url+'/rows/:index'} component={EditTable} table={embeddedTable} 
						isEmbedded={true}  {...{tables, generators, handleChange, totalWeight, pack, handleBulkAdd, handleDelete}} id={match.url} />
					<PropsRoute path={match.url} exact component={Display} 
						{...this.state} 
						{...{tables, generators, handleChange, handleAdd, isCreate, roll, isEmbedded, totalWeight, handleBulkAdd, rows, handleDelete }} 
						location={match.url} />
				</Switch>
			</div>
		)
	}
}