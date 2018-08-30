import React, { Component } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
import PropTypes from "prop-types";
import WebFont from 'webfontloader';

import { PropsRoute, RouteWithSubRoutes } from '../Routes';
import ThingExplorer from "../ThingExplorer/ThingExplorer.js";
import Characters from "../Characters/Characters.js";
import Character from "../Characters/Character.js";
import Login from "./Login.js";
import { PacksPage } from "../Packs/Packs";
import EditPack from "../Packs/EditPack";
import Pack from "../Packs/Pack";
import Universes from '../Universes/Universes';
import EditUniverse from '../Universes/EditUniverse';
import Explore from "../Explore/Explore";
import DB from "../../actions/CRUDAction";
import Nav from './Nav';
import Splash from '../Explore/Splash';
import Tables from '../Tables/Tables';
import EditTable from '../Tables/EditTable';
import Table from '../Tables/Table';
import { GeneratorsPage } from '../Generators/Generators';
import Generator from '../Generators/Generator';
import EditGenerator from '../Generators/EditGenerator';
import PlayersPreview from '../Explore/PlayersPreview'
// import { sendPlayersPreview } from '../../actions/WebSocketAction';

import "./App.css";

const NotFound = () => (
	<div className="main">
		<div className="container mt-5">
			<h1>404 Not Found</h1>
		</div>
	</div>
)

const LOADING_GIF = <i className="loading fa fa-spinner fa-spin"></i>;

const routes = [
	{
		path: '/packs',
		component: PacksPage,
		routes: [
			{
				path: '/:pack',
				component: Pack,
				routes: [
					{
						path: '/edit',
						private: true,
						component: EditPack
					},
					{
						path: '/explore',
						component: Explore
					},
					{
						path: '/generators',
						component: GeneratorsPage,
						routes: [
							{
								path: '/create',
								isCreate: true,
								private: true,
								component: EditGenerator
							},
							{
								path: '/:generator',
								component: Generator,
								routes: [
									{
										path: '/edit',
										private: true,
										component: EditGenerator
									}
								]	
							}
						]
					},
					{
						path: '/tables',
						component: Tables,
						routes: [
							{
								path: '/create',
								private: true,
								isCreate: true,
								component: EditTable
							},
							{
								path: '/:table',
								component: Table,
								routes: [
									{
										path: '/edit',
										private: true,
										component: EditTable
									}
								]
							}
						]
					}
				]
			}
		]
	},
	{
		path: '/universes/:universe?',
		component: Universes,
		private: true,
		routes: [
			{
				path: '/create',
				isCreate: true,
				private: true,
				component: EditUniverse
			},
			{
				path: '/explore',
				private: true,
				component: Explore
			},
			{
				path: '/edit',
				private: true,
				component: EditUniverse
			}
		]
	},
	{
		path: '/characters',
		component: Characters,
		routes: [
			{
				path: '/:character',
				component: Character
			}
		]
	},
	{
		path: '/players-preview',
		component: PlayersPreview
	},
	{
		path: '/things',
		component: ThingExplorer
	},
	{
		path: '/explore/:packurl',
		component: Explore
	}
]

class App extends Component {
	constructor(){
		super();
		this.state = {
			loggedIn: true,
			loadedFonts: []
		}
		this.handleLogin = this.handleLogin.bind(this);
		this.handleLogout = this.handleLogout.bind(this);
		this.handleLoadFonts = this.handleLoadFonts.bind(this);
	}
	static get childContextTypes(){
		return {
			loggedIn: PropTypes.bool,
			loadFonts: PropTypes.func,
			//sendPlayersPreview: PropTypes.func
		}
	}
	getChildContext(){
		return { 
			loggedIn: !!this.state.loggedIn,
			loadFonts: this.handleLoadFonts,
			//sendPlayersPreview: this.sendPlayersPreview
		}
	}
	/*sendPlayersPreview = (icon) => {
		sendPlayersPreview({src: icon})
	}*/
	handleLoadFonts(fonts, source = 'google'){
		if(!(fonts instanceof Array))
			fonts = [fonts];

		const lf = this.state.loadedFonts;

		// remove fonts already loaded
		fonts = fonts.filter((f)=>!lf.includes(f));

		if(!fonts.length) return;

		WebFont.load({
			[source]: {
				families: fonts
			}
		})

		this.setState({ loadedFonts: lf.concat(fonts) })
	}
	componentDidMount(){
		DB.fetch("loggedIn").then((result) => {
			if(result.data)
				this.setState({ loggedIn: !!result.data.loggedIn })
		})
	}
	shouldComponentUpdate(nextProps, nextState){
		const newProps = nextProps !== this.props;
		const changedLoggedIn = nextState.loggedIn !== this.state.loggedIn;
		return newProps || changedLoggedIn;
	}
	handleLogin(url, payload){
		return DB.create(url, payload).then((result) => {
			var loggedIn = !result.error && result.data;
			this.setState({ loggedIn: !!loggedIn });
			return result;
		});
	}
	handleLogout(){
		return DB.fetch('logout', "POST").then((result) => {
			this.setState({ loggedIn: !!result.data.loggedIn })
			return result;
		});
	}
	render() {
		return (
			<Router>
				<div className="app">
					<Switch>
						<Route exact path="/players-preview" />
						<PropsRoute component={Nav} handleLogout={this.handleLogout} />
					</Switch>
					<Switch>
						<Route exact path="/" component={this.state.loggedIn ? Universes : Splash} />
						{routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)}
						<PropsRoute path="/login" component={Login} title="Login" handleLogin={this.handleLogin} />
						<PropsRoute path="/signup" component={Login} title="Sign up" handleLogin={this.handleLogin} />
						<Route component={NotFound} />
					</Switch>
				</div>
			</Router>
		);
	}
}

export default App;
export { NotFound, LOADING_GIF };
