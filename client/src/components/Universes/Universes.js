import React, { Component } from "react";
import { Switch } from "react-router-dom";
import PropTypes from "prop-types";

import DB from '../../actions/CRUDAction';
import CreateUniverse from './CreateUniverse';
import EditUniverse from './EditUniverse';
import Explore from '../Explore/Explore'
import { LOADING_GIF } from '../App/App';
import Packs, { PackUL } from '../Packs/Packs';
import { PropsRoute, RouteWithSubRoutes } from '../Routes';

const UniverseListDisplay = ({list}) => (
	<div className="main">
		<div className="container mt-5">
			<div className="universes">
				<h1>Universes</h1>
				<PackUL list={list} isUniverse={true} addButton={true} />
			</div>
			<Packs />
		</div>
	</div>	
)

class Universes extends Component {
	state = {
		loading: true,
		universes: undefined,
		error: undefined,
		generators: undefined,
		tables: undefined,
		universe: undefined,
		packs: undefined
	}
	static contextTypes = {
		loadFonts: PropTypes.func
	}

	static propTypes = {
		match: PropTypes.object
	}
	static defaultProps = {
		match: { params: {} }
	}

	componentDidMount(){
		this.getData(this.props);
	}

	componentDidUpdate(prevProps){
		if(!this.props.match.params) return;

		if(this.props.match.params.universe !== prevProps.match.params.universe)
			this.getData(this.props);
	}

	getData(props){
		if(!props) props = this.props;
		if(!this.props.match.params) return;

		const universe = (props.match && props.match.params && props.match.params.universe) || {};
		if(!this.state.loading) 
			this.setState({loading: true})

		if(universe && universe !== 'create'){
			DB.get('universes', universe).then(({error, data: universe})=>{

				this.setState({error, universe, loading: false});

				if(universe && universe.pack){
					DB.fetch(`builtpacks/${universe.pack._id}/generators`).then(({error, data: generators})=>{
						this.setState({ error, generators });
					});
					DB.fetch(`packs/${universe.pack._id}/tables`).then(({error, data: tables})=>{
						this.setState({ error, tables });
					});
					
					this.context.loadFonts(universe.pack.font);
				}
			})
		}
		else if(universe === 'create'){
			DB.get('packs').then(({error, data:packs})=>this.setState({error, packs, loading: false}));
		}
		else
			DB.get('universes').then(({error, data})=>this.setState({error, data, loading: false}));
	}

	handleSave = (e) => {
		if(!this.props.match.params) return;
		e.preventDefault()
		var formData = new FormData(e.target);
		const id = this.props.match.params.universe;

		DB.set("universes", id, formData).then(result=>{
			this.setState(result)
			this.props.history.goBack();
		});
	}

	handleDelete = () => {
		if(!this.props.match.params) return;

		const id = this.props.match.params.universe;
		DB.delete("universes",id).then(({error, doc})=>{
			if(error) this.setState({error: error});
			else this.props.history.goBack();
		});
	}

	handleAdd = (event, selectedPack) => {
		event.preventDefault();
		var fd = new FormData(event.target);
		fd.set('pack', selectedPack);
		var _this = this;

		DB.create('universes', fd).then(({error,data})=>{
			if(error) return _this.setState({ error, data });
			_this.props.history.push(`/universes/${data._id}/explore`)
		})
	}

	handleRefresh = ()=> {
		const universe = this.props.match.params.universe;
		DB.get('universes', universe).then((result)=>this.setState(result));
	}

	/**
	 * Move a generator to the top of the stack
	 */
	handleSortGens = (gen) =>{
		var gens = this.state.generators;
		var genOrder = gens.indexOf(gen);
		if(genOrder!==-1){
			gens.splice(genOrder, 1);
			gens.unshift(gen);
			this.setState({ generators: gens });
		}
	}

	handleRenameGen = (oldname, newname) =>{
		var gens = this.state.generators;
		if(!gens) return;
		if(oldname !== null && newname)
			gens.splice(gens.indexOf(oldname), 1, newname);
		else if(newname === null)
			gens.splice(gens.indexOf(newname), 1);
		else
			gens.unshift(newname);
	}

	render(){
		const { routes = [], match } = this.props
		const { handleRenameGen, handleSortGens, handleRefresh, handleAdd, handleDelete, handleSave } = this;

		var content = (this.state.error) ? <div className="main">{this.state.error.display}</div>
			: (this.state.loading) ? <div className="main">{LOADING_GIF}</div>
			: (<div id="Universes">
					<Switch>
						{routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} path={match.path+route.path} />)}
						<PropsRoute component={UniverseListDisplay} />
					</Switch>
				</div>)

		return content;
	}
}


const Routes = ({ match, data, universe= {}, packs, generators, tables, handleDelete, handleSave, handleAdd, handleSortGens, handleRenameGen, handleRefresh }) => (
	<Switch>
		<PropsRoute exact path={`/universes/create`} component={CreateUniverse} handleAdd={handleAdd} data={packs} />
		<PropsRoute path={`/universes/:universe/explore`} component={Explore} 
			{...{universe, generators, tables, handleSortGens, handleRefresh}} />
		<PropsRoute path={`/universes/:universe/edit`} component={EditUniverse} {...universe} 
			handleDelete={handleDelete} handleSave={handleSave}/>
		{/*<PropsRoute path={`/universes/:universe/generators/:isa?`} component={Generator} {...universe} 
			handleDelete={handleDelete} handleSave={handleSave} packid={(universe && universe.pack) ? universe.pack._id : ''} handleRenameGen={handleRenameGen} generators={generators} tables={tables} />*/}
		<PropsRoute component={UniverseListDisplay} list={data} />
	</Switch>
)

export default Universes;