import React, { Component } from "react";
import PropTypes from "prop-types";
import WebFont from 'webfontloader';

import DB from "../../actions/CRUDAction";
import ExplorePage, { LOADING } from './ExplorePage'

import './Explore.css';

/**
 * This manages the tree data
 */
export default class TreeManager extends Component {
	static propTypes = {
		// should be auto-passed from router
		location: PropTypes.object.isRequired,
		match: PropTypes.object.isRequired
	}
	constructor(props){
		super(props);

		this.state = {
			current: (props.location.state) ? props.location.state.current : null, // the current node being viewed
			lookup: {}, // a lookup of index pointers in case the user uses back/forward
			error: null,
			loadedFonts: []
		}

		this.handleRestart = this.handleRestart.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.setIndex = this.setIndex.bind(this);
	}
	// first ajax data pull
	componentDidMount(){
		var index = this.getIndexFromHash(this.props);
		var _this = this;

		return DB.get(this.props.location.pathname, index)
			.then(({ error, data: current })=>{

				if(error){
					_this.setState({ error: error.display });
				}

				else if(current){
					var lookup = this.state.lookup;
					lookup[current.index] = current;
					_this.setCurrent({ current , lookup, error });
					if(current.index !== index) _this.setIndex(current.index);
				}
			});
	}

	// location has changed
	componentWillReceiveProps(nextProps){
		const isNewPack = (this.props.match.params.packurl !== nextProps.match.params.packurl) && (!!nextProps.match.params.packurl);;
		const isNewNode = (this.props.location.hash !== nextProps.location.hash
					 && "#"+this.state.current.index !== nextProps.location.hash);

		// set current does the lookup
		if( isNewNode || isNewPack ){
			var index = this.getIndexFromHash(nextProps);
			if(this.state.lookup[index]){
				this.setCurrent({ current: this.state.lookup[index], error: null }, nextProps)
			}
			else if(isNewPack && this.props.location.state !== nextProps.location.state){
				this.setCurrent({ current: nextProps.location.state.current, error: null }, nextProps);
			}
		}
	}

	shouldComponentUpdate(nextProps, nextState){
		this.makeUrlMatchCurrent(nextState, nextProps);

		return this.state.current !== nextState.current 
			|| this.state.error !== nextState.error
			|| this.props.match !== nextProps.match;
	}

	getIndexFromHash(props){
		return props.location.hash ? parseInt(props.location.hash.substr(1), 10) : "";
	}

	setCurrent(data, props){

		if(data){
			data.error = null;
			this.setState(data);
		}

		if(!props) props = this.props;

		var curr = data.current;
		if(curr === null) return;
		const _this = this;

		// load webfont
		if(curr.font && !this.state.loadedFonts.includes(curr.font)){
			WebFont.load({
				google: {
					families: [curr.font]
				}
			});
			var lf = [curr.font].concat(this.state.loadedFonts)
			this.setState({loadedFonts:lf});
		}

		// detect if need to start the ajax call
		var getChildren = (curr.in === true)
		if(getChildren){
			DB.get(props.location.pathname, curr.index)
				.then(({ error, data: current })=>{
					if(error){
						_this.setState({ error: error.display });
					}
					else{
						current.index = parseInt(current.index, 10);
						var lookup = _this.state.lookup;
						lookup[current.index] = current;
						var isCurrentlyVisible = (_this.state.current.index === current.index 
							|| typeof _this.state.current.index === 'undefined');

						if(isCurrentlyVisible){
							_this.setState({ current, lookup });
						}else{
							_this.setState({lookup});
						}
				}
			});
		}
	}

	// will set the history, and component will recieve the new props
	setIndex(index){
		if(isNaN(index)) return;

		if(index === 0){
			if(this.props.location.hash !== "")
				this.props.history.push(this.props.location.pathname);
		}
		else if(this.props.location.hash !== '#'+index){
			this.props.history.push('#'+index);
		}
	}

	handleRestart(){
		this.setCurrent({current: null, lookup: {}, error: null });
		this.setIndex(0);

		// reset universe
		DB.fetch('explore', "DELETE")
			.then(()=>{ return DB.fetch(this.props.location.pathname)})
			.then(({err , data})=>{
				this.setState({ current: data, lookup:{ [data.index] : data }})
				this.setIndex(data.index);
			});
	}

	handleClick(child){
		var lookup = this.state.lookup;

		if(child.in === true){
			if(lookup[child.index])
				child = lookup[child.index];
		}else{
			lookup[child.index] = child;
		}

		this.setCurrent({ current: child, lookup: lookup, error: null })
	}

	makeUrlMatchCurrent(nextState, nextProps){
		const nextHash = this.getIndexFromHash(nextProps);
		const isNewIndex = nextState.current	&& nextState.current.index !== nextHash;

		//ensure that the url matches the thing being rendered
		if(isNewIndex){
			this.setIndex(nextState.current.index);
		}
	}

	render(){ 

		if(this.state.error)
			return <div className="main">{this.state.error}</div>;

		if(!this.state.current) 
			return <div className="main mt-5">{LOADING}</div>

		return (
			<ExplorePage {...this.state.current} 
						handleRestart={this.handleRestart} 
						handleClick={this.handleClick} 
						setIndex={this.setIndex} />
		)
	}
}

