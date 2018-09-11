import React, { Component } from "react";
import PropType from "prop-types";
import { Link, Switch } from "react-router-dom";
import async from 'async';
import debounce from 'debounce';

import DB from "../../actions/CRUDAction";
import { RouteWithSubRoutes, PropsRoute } from '../Routes';
import { LOADING_GIF } from '../App/App';

class ViewGenerator extends Component {
	static contextTypes = {
		loggedIn: PropType.bool
	}
	
	render(){
		const gen = this.props.built;
		const { pack: packid, generator: isa } = this.props.match.params

		if(!gen) return null;

		return (
			<div>
			
				<Link to={"/packs/"+packid }>⬑ Pack</Link>
				<h1>{isa}</h1>

				{/* --------- Edit Button ------------ */}
				{this.context.loggedIn ? (
					<Link to={"/packs/" + packid + "/generators/"+ isa +"/edit"}>
						<button className="btn btn-primary">
							Edit Generator
						</button>
					</Link>
				) : null}

				<ul>
					{Object.keys(gen).map((k,i)=>{
							return (
								<li key={i}><strong>{k}</strong>: { (gen[k] instanceof Object) ? 
									<pre>{JSON.stringify(gen[k],null,2)}</pre> : gen[k] }</li>
							)
						})
					}
				</ul>

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
	}

	static defaultProps = {
		handleRenameGen: ()=>{}
	}

	state = {
		generator: null,
		error: null
	}

	constructor(props){
		super(props);
		this.debouncedChange = debounce(this.debouncedChange.bind(this), 1000);
	}

	saver = async.cargo((tasks,callback)=>{
		//combine tasks
		var newValues = {};
		const { pack } = this.props.match.params;
		const { built = {}, unbuilt = {}} = this.state.generator || {};
		const _id = built._id || unbuilt._id

		tasks.forEach(t=>{
			if(!t.property) return;
			newValues[t.property] = t.value
		});

		DB.set('packs/'+pack+"/generators", _id, newValues).then(({error, data})=>{
			if(error) this.setState({generator: data, error});
			callback();
		});
	})

	componentDidMount() {
		const { pack: packid, generator: isa } = this.props.match.params;

		if(isa) {
			DB.get('packs/'+packid+'/generators', isa)
				.then(({ error, data })=>{
					this.setState({ generator: data, error: error })
				});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot){
		var { generator = { built: {} } } = this.state; 
		if(!generator) generator = { built: {} };
		if(!generator.built) generator.built = {};

		const urlChanged = this.props.match.params.generator !== prevProps.match.params.generator;
		const isaDifferentThanSaved = this.props.match.params.generator !== generator.built.isa
		if(urlChanged && isaDifferentThanSaved){
			console.log('test');
		}
	}

	handleDelete = () => {
		const { pack, generator } = this.props.match.params;

		DB.delete('packs/'+pack+'/generators', this.state.generator.unbuilt._id)
			.then(({error, data}) =>{
				if(error) return this.setState({error});
				this.props.handleRenameGen(generator, null)
				this.props.history.push('/packs/'+pack);
			})
	}
	
	debouncedChange = (property, value) => {
		this.handleChange(property, value);
	}

	handleChange = (property, value) => {
		this.saver.push({ 
			property: property,
			value: value
		}, ()=>{
				if(property === 'isa'){
					const { pack, generator } = this.props.match.params;
					var newUrl = this.props.match.path.replace(':pack',pack).replace(':generator',value)+'/edit';
					this.props.history.replace(newUrl);
					this.props.handleRenameGen(generator, value);
				}
			})
	} 

	render() {

		const { match, pack, routes } = this.props;
		const { generator, error } = this.state;
		const { handleChange, handleDelete } = this;

		var content;
		if(error) content = error.display;
		else if(!generator && match.params.generator) content = LOADING_GIF;
		else {
			content = (
				<Switch>
					{routes.map((route, i) => 
						<RouteWithSubRoutes key={i} {...route} path={match.path+route.path}
							{...{pack, handleChange, handleDelete}} {...generator} id={generator._id} />)}
					<PropsRoute exact path={match.path} component={ViewGenerator} {...generator} />
				</Switch>
			);
		}

		return (
			<div id="Generator">
				{content}
			</div>
		)
	}
}
