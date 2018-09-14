import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import { getQueryParams } from '../../util/util';
import IconSelect from '../Form/IconSelect';
import IsASelect from '../Form/IsASelect'; 
import MixedThing, { MixedKeyValue, MixedSortable }from '../Form/MixedThing';

function mixedToPlainType(data){
	if(!data || typeof data === 'string')
		return data;
	else if(!data.type || data.type === 'string')
		return data.value;
	else if(data.type === 'table'){
		return data.value.rows.map(r=>mixedToPlainType(r));
	}
}

function handleNestedPropertyValue(property, value, state){
	if(typeof property === 'string') return {property, value};

	for (var i = property.length - 1; i >= 0; i--) {

		// the top level
		if(i === 0) {
			property = property[i];
			if(state[property] instanceof Array){
				var newValue = state[property].concat([]);
				newValue.splice(0, value.length, ...value);
				value = newValue;
			}
			else value = {...state[property], ...value};
		}

		// the deepest level
		else if(i === property.length - 1){
			// the value is the new array
			if (property[i] === 'sort'){
				var oldIndex = property[--i];
				var newIndex = value;
				var array = state[property[--i]]
				var child = array.splice(oldIndex,1)[0];
				array.splice(newIndex,0,child);
				property = property[i];
				value = array;
			}
			else{
				value = { [property[i]]: value }	
			}
		}

		// the middle level
		else{
			var oldValue = state;
			for(var j = 0; j <= i; j++){
				oldValue = oldValue[property[j]];
			}
			value = { [property[i]]: {...oldValue, ...value} }
		}
	}

	return {property, value};
}

const Data = ({data = {}, tables, generators, handleChange}) => (
	<div className="form-group">
		<label className="mr-1">Data</label>
		<MixedKeyValue options={{
			property: 'data',
			types: ['string', 'generator', 'table_id', 'embed', 'json', 'table']
		}} {...{tables, generators, handleChange}} map={data} />
	</div>
)	

const Display = ({inherits, isCreate, isa, extends: xtends, name, desc, style, in: inArr = [], tables = [], generators = [], source = {}, handleChange, handleAdd, handleDelete, isUnique, chooseRandom, data = {}, match = {}}) => (
	<form onSubmit={(e)=>{
		e.preventDefault();
		e.target.blur();
	}}>

		{/* --------- Name ------------ */}
		<div className="form-group">
			{ !inherits ? 
				<input value={isa} required name="isa" className="input-title input-transparent"
					autoFocus={isCreate} placeholder="generator label" onChange={(e)=>handleChange('isa',e.target.value)} /> 
			: <span>{isa}</span> }
		</div>

		{/* --------- Name ------------ */}
		<div className="form-group">
			<label>
				<input type="checkbox" checked={isUnique} name="isUnique" onChange={(e)=>handleChange('isUnique',!isUnique)} /> <strong>Unique:</strong> There can only be one of these in a universe
			</label>
		</div>

		{!isCreate ? 
			<div>

				{/* --------- Choose Random ------------ */}
				{ !isUnique
				? <div className="form-group">
						<label>
							<input type="checkbox" checked={chooseRandom} name="chooseRandom" onChange={(e)=>handleChange('chooseRandom',!chooseRandom)} /> 
							<strong> Replace with Random:</strong> When you add this is a universe, it will be replaced with a random generator that "Is a" {isa}.
						</label>
					</div>
				: null}
				

				{/* --------- Is a... ------------ */}
				<div className="form-group">
					<label>Is a... <Link to={match.url.replace(isa, encodeURIComponent(xtends))}>{xtends}</Link> </label>
					<IsASelect 
						onChange={(o)=>{
							handleChange('extends', o && o.value)
						}} 
						options={generators} 
						defaultValue={{label: xtends||'', value: xtends||''}}
						isClearable
						name="isa"
					/>
				</div>

				{/* --------- Display Name ------------ */}
				<div className="form-group">
					<label className="mr-1">Display Name</label>

					{ name !== undefined && name !== null ? 
						<MixedThing options={{
							property: ['name'],
							types: ['string', 'table_id', 'table'],
							deleteOne: true
						}} {...{tables, generators, handleChange}} {...name} />
					: <button className="btn btn-primary" onClick={()=>handleChange(['name'],{type: 'string'})}>
							<i className="fas fa-plus" /> edit
						</button> }
					
				</div>

				{/* --------- Icon ------------ */}
				
				{ (style.useImg !== undefined && style.useImg !== null) || style.img || style.icon 
				? (<div>

						<select value={style.useImg} className="input-transparent" onChange={(e)=>handleChange(['style','useImg'],e.target.value)}>
							<option value={false}>Icon</option>
							<option value={true}>Image</option>
						</select>
						<button className="btn btn-default" onMouseDown={()=>{
								console.log('use default');
								handleChange(['style','icon'], undefined);
								handleChange(['style','img'], undefined);
								handleChange(['style','useImg'], undefined);
							}}>
							use default?
						</button>

						{style.useImg 
						? <input className="form-control" value={mixedToPlainType(style.img)} 
								onChange={(e)=>handleChange(['style','img'],{value: e.target.value}
							)} />
						: <IconSelect value={mixedToPlainType(style.icon)}  status={{isEnabled: true}} saveProperty={(v)=>handleChange(['style','icon'],v)} setPreview={()=>{}} multi={true} />}
					</div>)
				: <div className="form-group">
						<label className="mr-1">Icon or Image</label> 
						<button className="btn btn-primary" onClick={()=>handleChange(['style','useImg'],false)}>
							<i className="fas fa-plus" /> add
						</button>
					</div>
				}

				
				{/* --------- Description ------------ */}
				<div className="form-group">
					<label className="mr-1">Description</label>
					{desc && desc.length ? 
						<MixedSortable options={{
							property:['desc'],
							types: ['string', 'table_id', 'table'],
							isTextarea: true
						}} array={desc} 
						{...{handleChange, tables, generators}} />
					: null }
					<button className="btn btn-primary" onClick={()=>handleChange(['desc',desc.length],{type: 'string'})}>
						<i className="fas fa-plus" /> add
					</button>
				</div>

				{/* --------- In / Contains ------------ */}
				<div className="form-group">
					<label className="mr-1">Contains</label>
					<MixedSortable options={{
							property:['in'],
							types: ['generator', 'string', 'embed', 'data', 'table_id'],
							showAmount: true
						}} array={inArr} 
						tables={tables && tables.filter((t)=>t.returns==='generator')}
						{...{handleChange, generators}} />
					
					<button className="btn btn-primary" onClick={()=>handleChange(['in',inArr.length],{type: 'generator'})}>
						<i className="fas fa-plus" /> add
					</button>
				</div>

				{/* --------- Data ------------ */}
				<Data {...{data, handleChange, tables, generators}}/>
				

				{/* --------- Source ------------ */}
				<div className="form-group">
					<label>Source URL</label>
					<input value={source.url} name="source" className="form-control"
						onChange={(e)=>handleChange('source', { ...source, url: e.target.value } )} />
				</div>

				{/* --------- Delete ------------ */}
				<button className="btn btn-danger" onClick={ handleDelete }>Delete Generator</button>
			</div>
		: <button className="btn btn-primary" onClick={()=>handleAdd(isa)} >Create</button> }
	</form>
)

export default class EditGenerator extends Component {
	static propTypes = {
		built: PropTypes.object,
		unbuilt: PropTypes.object,
		pack: PropTypes.object,
		handleAdd: PropTypes.func,
		handleChange: PropTypes.func
	}

	static defaultProps = {
		"unbuilt": {},
		pack: {},
		handleAdd: ()=>{}
	}

	constructor(props){
		super(props)
		var rawData = props.unbuilt || (props.location.state && props.location.state.data) || {};
		const params = getQueryParams(this.props.location);

		this.state = {
			isa: rawData.isa || params.isa || "",
			source: rawData.source || {},
			style: rawData.style || {},
			error: undefined,
			extends: rawData.extends,
			name: rawData.name,
			desc: rawData.desc || [],
			in: rawData.in || [],
			isUnique: rawData.isUnique || false,
			chooseRandom: rawData.chooseRandom || false,
			data: rawData.data || {}
		}
	}

	handleChange = (prop, val) => {
		var valid, property, value;
		this.setState((prevState)=>{

			// nested property, need to parse the array
			const result = handleNestedPropertyValue(prop, val, prevState);
			property = result.property;
			value = result.value;

			if(property === 'unique' && value){
				this.handleChange("chooseRandom", false);
			}

			// TODO: error messagin
			valid = true;
			const generators = Object.keys(this.props.pack.generators);
			if(property === 'isa' && generators.includes(value)){
				valid = false;
			}

			if(property === 'name'){
				if(value && !value.value) value.value = null;
			}

			if(value instanceof Array && value.length === 0){
				value = null;
			}

			return {[property]: value}
		}, ()=>{
			if(this.props.handleChange && valid){
				this.props.handleChange(property, value);
			}
		})

		
	}
	
	render() {
		const { isCreate, match, pack } = this.props;
		const built = this.props.built || {}
		const inherits = built.gen_ids && built.gen_ids.length > 1;
		const gens = Object.keys(this.props.pack.generators) || [];
		gens.splice(gens.indexOf(this.state.isa), 1);

		return (
			<div id="EditGenerator">
				<Display {...this.state} {...this.props} 
					handleChange={this.handleChange} generators={gens} tables={pack.tables}
					{...{isCreate, match, inherits}} />
			</div>
		);
	}
}

export {handleNestedPropertyValue};