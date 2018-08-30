import React from "react";
import { Link, Switch } from "react-router-dom";
import PropTypes from 'prop-types';

import { RouteWithSubRoutes, PropsRoute } from '../Routes';
import DB from '../../actions/CRUDAction'

const Filters = ({filters= {}, handleFilterToggle}) => (
	<div className="filters col-auto">
		<div className="form-check">
			<input className="form-check-input" type="checkbox" value={filters.unique} id="unique" 
				onChange={()=>handleFilterToggle("unique") } />
			<label className="form-check-label" htmlFor="unique">Unique</label>
		</div>
		{/*
		<div className="form-check">
			<input className="form-check-input" type="checkbox" value={filters.notUnique} id="notUnique" 
				onChange={()=>handleFilterToggle("notUnique")} />
			<label className="form-check-label" htmlFor="notUnique">Not Unique</label>
		</div>
	*/}
	</div>
)

const FiltersToString = ({filters = {}}) => (
	<div>
	{ filters.length ? 
		<span><i className="fa fa-filter"></i>Filtered by: {filters.join(", ")}</span>
	: null}
	</div>
)

export default class Generators extends React.Component {

	static propTypes = {
		generators: PropTypes.object,
		isOwner: PropTypes.bool,
		match: PropTypes.object
	}

	state = {
		filters: {},
		query: '',
		generatorTree: {},
		filteredGens: false,
		open: []
	}

	constructor(props){
		super(props);
		this.state.generatorTree = this.buildTree(props.generators || {});
	}

	componentWillReceiveProps(nextProps){
		if(this.props.generators !== nextProps.generators){
			let generatorTree = this.buildTree(nextProps.generators);
			this.setState({ generatorTree })
		}
	}

	buildTree = (gens) => {
		const generators = gens;
		var genTree = {};
		var current, extendsPath;
		var placed = [];

		for(var isa in generators){
			if(placed.includes(isa)) 
				continue;
			
			current = genTree;
			extendsPath = generators[isa].extendsPath || [];

			// extends path
			for(var i = 0, is; i < extendsPath.length; i++){
				is = extendsPath[i];

				if(!current[is]) 
					current[is] = {}
				current = current[is];
				if(!placed.includes(is)) 
					placed.push(is);
			}
			current[isa] = {};
			placed.push(isa);
		}
		return genTree;
	}

	

	filterGenerators = () => {
		this.setState((state) => {
			var filteredGens = [], hidden = 0,
			gen, include, 
			{filters, query} = state,
			{ generators } = this.props;

			if(query.length < 3) query = false;

			for(var isa in generators){
				gen = generators[isa];
				include = true;

				if( (query && !isa.includes(query))
					|| (filters.unique && !gen.isUnique)
					|| (filters.notUnique && gen.isUnique)
				){
					include = false;
				}

				if(include){
					filteredGens.push(gen.isa);
				}
				else hidden++;
			}
			
			// no filter
			if(hidden === 0 && !query) filteredGens = false;

			return {filteredGens}
		});
	}

	handleGeneratorToggle = (isa) => {
		// make a copy so we don't directly edit the state
		var open = [...this.state.open];
		const index = open.indexOf(isa)
		if(index === -1) open.push(isa);
		else open.splice(index, 1);

		this.setState({open: open});
		this.filterGenerators();
	}

	handleQuery = (event) => {
		this.setState({query: event.target.value})
		this.filterGenerators();
	}

	handleFilterToggle = (key) => {
		let filters = {...this.state.filters, [key]: !this.state.filters[key]}
		this.setState({filters: filters})
		this.filterGenerators();
	}

	render = () => {
		const { match = { params: {} }, isOwner, generators } = this.props;
		const { handleGeneratorToggle, handleFilterToggle, handleQuery } = this;
		const packid = match.params.pack;

		return (
			<GeneratorsList {...this.state} {...{ handleGeneratorToggle, handleFilterToggle, handleQuery, isOwner, generators, packid }} />	
		)
	}
}

class GeneratorsPage extends React.Component {

	static propTypes = {
		handleRenameGen: PropTypes.func
	}

	static defaultProps = {
		handleRenameGen: ()=>{}
	}

	handleAdd = (isa) => {
		var payload = { isa: isa };
		const packid = this.props.match.params.pack;

		DB.create('packs/'+packid+"/generators", payload).then(({error,  data: generator})=>{
			if(error) 
				return this.setState({error});
			this.setState({ generator }, ()=>{
				this.props.history.replace(this.props.location.pathname.replace('/create','/'+isa+'/edit'));
				this.props.handleRenameGen( null, isa, generator.unbuilt );
			});
			
		});
	}

	render = () => {
		const {routes, match, pack, ...rest} = this.props;
		const { handleAdd } =  this;

		return (
			<div id="Generators" className="main">
				<div className="container mt-5">
					<Switch>
						{routes.map((route, i) => 
							<RouteWithSubRoutes key={i} {...route} path={match.path+route.path} {...{handleAdd,pack}} />)}
						<PropsRoute {...rest} exact path={match.path} component={Generators} packid={match.params.pack} 
							{...{handleAdd}} />
					</Switch>
				</div>
			</div>
		)
	}
}

const GeneratorsList = ({query, filters, isOwner, handleFilterToggle, packid, handleQuery, ...rest}) => (
	<div>
		<h2>Generators</h2>

		<div className="input-group">
			<input className="form-control" value={query} onChange={handleQuery} />
			<div className="input-group-append">
				<span className="input-group-text"><i className="fa fa-search" /></span>
			</div>
		</div>
		<div className="row">
			<Filters filters={filters} handleFilterToggle={handleFilterToggle} />
			<div className="col">
				{ !isOwner ? null :
					<Link to={"/packs/" + packid + "/generators/create"}>
						<button className="btn btn-primary">
							<i className="fa fa-plus"/> Add Generator
						</button>
					</Link>
				}
				<FiltersToString filters={filters} />

				<hr />
				<NestedGenerators {...rest} {...{isOwner, packid}} />
			</div>
		</div>
	</div>
)

const NestedGenerators = ({ generatorTree = {}, generators, packid, isOwner = false, handleGeneratorToggle = ()=>{}, filteredGens = [], open = []}) => (
	<ul>
		{ filteredGens && filteredGens.map
			? filteredGens.map(isa=>(
					<li key={isa}>
						<Link to={'/packs/'+packid+"/generators/"+encodeURIComponent(isa) +(isOwner ? '/edit': '')}>
							{isa}
						</Link>
						{ generators[isa].extends ? <em className="ml-2">{generators[isa].extends}</em> : null}
					</li>
				))
			: Object.keys(generatorTree).sort().map(isa=>{
					const isOpen = open.includes(isa);
					return (
						<li key={isa}>

							{/* expand/collpase button */}
						  { Object.keys(generatorTree[isa]).length ?
						  	<button className="mr-1" onClick={()=>handleGeneratorToggle(isa)}>
									<i className={`fas fa-${isOpen ? 'minus' : 'plus'}-circle`} />  
								</button>
						  : null }
						  <Link to={'/packs/'+packid+"/generators/"+encodeURIComponent(isa) +(isOwner ? '/edit': '')}>{isa}</Link>
							{ isOpen  ? 
								<NestedGenerators generatorTree={generatorTree[isa]} 
									{...{open, handleGeneratorToggle, filteredGens, isOwner, packid, generators }} />
							: null}
							
						</li>
					)
			})
		}
	</ul>
);

export { GeneratorsPage }