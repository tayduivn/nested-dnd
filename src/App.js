import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Nested from './Nested/Nested.js';
import ThingExplorer from './Nested/ThingExplorer.js';
import { IconDebug } from './Nested/Debug.js'
import Settings from './Nested/Settings.js';

class Nav extends Component {
	render(){
		return (
			<nav className="navbar navbar-default navbar-fixed-top">
				<div className="container-fluid">
					<div className="navbar-header">
						<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
							<span className="sr-only">Toggle navigation</span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
						</button>
						<Link className="navbar-brand" to="/nested#0">Nested D&D</Link>
						
					</div>

					<div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
						<ul className="nav navbar-nav">
							<li><Link to="/nested#0">Nested</Link></li>
							<li><Link to="/things">Thing Explorer</Link></li>
						</ul>
						<ul className="nav navbar-nav navbar-right">
							<li><Settings /><IconDebug show={false}></IconDebug></li>
						</ul>
					</div>
					
				</div>
			</nav>
		)
	}
}

class App extends Component {
	render() {
		return (
			<Router>
				<div className="App">
					<Nav/>
					<Switch>
						<Route exact path='/' component={Nested} />
						<Route path='/nested' component={Nested} />
						<Route path='/things' component={ThingExplorer} />
					</Switch>
				</div>
			</Router>
		);
	}
}

class Home extends Component {
	render() {
		return (
			<p className="App-intro">
				To get started, edit <code>src/App.js</code> and save to reload.
			</p>
		);
	}
}

export default App;
