import React, { Component } from "react";
import { Link, Switch, Route } from "react-router-dom";
import PropTypes from "prop-types";

import DB from '../../actions/CRUDAction';
import { LOADING_GIF } from '../App/App'; 
import { RouteWithSubRoutes } from '../Routes';

import './Packs.css';

const PackLink = ({_id, name, title, txt, font, cssClass, description, isUniverse, dependencies, lastSaw, ...pack}) => (
	<li className={`col`}>
		<div className="btn-group">
			<Link to={(isUniverse) ? "/universes/"+_id+"/explore" : "/packs/"+_id}  className={`btn col ${cssClass}`} style={{color: txt}}>
				<h1 style={{fontFamily: (font) ? `'${font}', serif` : 'inherit'}}>
					{title || name}
				</h1>
				{description ? <p>{description}</p> : null}
				{isUniverse && dependencies && dependencies.length ? <p><strong>Packs</strong>: {dependencies.join(", ")}</p> : null}
				{lastSaw ? <p><strong>Currently viewing:</strong> {lastSaw}</p> : null}
			</Link>
			<Link to={((isUniverse) ? "/universes/" : "/packs/")+_id+'/edit'} 
				className={`edit btn col-xs-auto d-flex align-items-center justify-content-center ${cssClass}`}  style={{color: txt}}>
				<h2><i className="fas fa-pen-square"/><small>Edit</small></h2>
			</Link>
		</div>
	</li>
)


const PackInput = ({_id, name, txt, font, cssClass, description, selected, onSelect, url, ...pack}) => (
	<li className={`col`}>
		<div className="btn-group">
			<button onClick={onSelect} id={_id} className={`btn col ${cssClass}`} style={{color: txt}}>
				<h1 className="webfont" style={{fontFamily: (font) ? `'${font}', serif` : 'inherit'}}>
					<span className={`fa-stack ${selected ? 'selected': ''}`}>
						<i className="fas fa-circle fa-2x" />
						<i className="fa fa-check fa-stack-1x"/>
					</span>
					{name}
				</h1>
				{description ? <p>{description}</p> : null}
			</button>
			{url ?
				<Link to={'/explore/'+url} className={`explore btn col-xs-auto ${cssClass}`} style={{color: txt}}>
					<h2><i className="fas fa-eye"/><small>preview</small></h2>
				</Link>
				: null}
		</div>
	</li>
)

class PackUL extends Component {
	static contextTypes = { loadFonts: PropTypes.func };

	componentDidMount(){
		if(this.props.list) 
			this.loadFonts(this.props.list);
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.list)
			this.loadFonts(nextProps.list);
	}

	loadFonts(list){
		var fonts = [];
		list.forEach(pack=>{
			if(!pack.font) return;
			if(!fonts.includes(pack.font))
				fonts.push(pack.font);
		});

		if(fonts.length)
			this.context.loadFonts(fonts);
	}
	render(){
		const list = this.props.list
			,	selectable = this.props.selectable
			, selected = this.props.selected
			, onSelect = this.props.onSelect
			, addButton = this.props.addButton
			, isUniverse = this.props.isUniverse;

		return (
			<ul className="row packs">
				{(list) ? list.map((p)=>{
					return (selectable) 
						? <PackInput key={p._id} {...p} selected={selected === p._id} onSelect={onSelect} /> 
						: <PackLink key={p._id} {...p.pack} {...p} isUniverse={isUniverse} />
				}) : null}
				{ addButton ? 
					<li className="col">
						<Link to={`${isUniverse?'/universes':'/packs'}/create`}
							className="create col btn btn-outline-primary d-flex align-items-center justify-content-center" >
							<span><i className="fas fa-plus"/> Create new</span>
						</Link>
					</li>
				: null}
				
				
			</ul>
		)
	}
}

const MyPacks = ({myPacks}) => (
	<div>
		<h2>My Packs</h2>
		{myPacks === null ? LOADING_GIF : ""}
		{myPacks && myPacks.length === 0 ? <p>You have not created any packs yet</p>: ""}
		{(myPacks) ? <PackUL list={myPacks} addButton={true} /> : null}
	</div>
);

const Display = ({loggedIn, error, data, publicPacks}) => (
	<div id="Packs > Display">
		{ loggedIn ? <MyPacks myPacks={data ? data.myPacks : null} /> : null }

		<h2>Public Packs</h2>

		{data === null ? LOADING_GIF : ""}
		{error ? error.display : null}

		{publicPacks && publicPacks.length === 0 ? <p>There are no public packs to display</p> : null}
		{(publicPacks) ? <PackUL list={publicPacks} /> : null}
	</div>
)

const PacksPageWrap = () => (
	<div className="main">
		<div className="container mt-5">
			<Packs />
		</div>
	</div>
);

const PacksPage = ({ routes, match = {} }) => (
	<div id="Packs">
		<Switch>
			{routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} path={match.path+route.path} />)}
			<Route exact path={match.path} component={PacksPageWrap} />
		</Switch>
	</div>
)

export default class Packs extends Component{
	state = {
			data: null,
			error: null
	}
	static contextTypes = { loggedIn: PropTypes.bool }
	componentDidMount(){ //fetch data
		const _t = this;
		DB.fetch("packs").then(result=>{
			_t.setState(result);
		});
	}
	render(){
		return <Display {...this.state} 
			loggedIn={this.context.loggedIn}
			publicPacks={this.state.data ? this.state.data.publicPacks : []} />;
	}
}

export { PackUL, PacksPage };