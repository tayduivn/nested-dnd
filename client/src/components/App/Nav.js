import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import './Nav.css';

export default class Nav extends Component {
	static get propTypes() {
		return {
			handleLogout: PropTypes.func
		};
	}
	static get contextTypes() {
		return { loggedIn: PropTypes.bool };
	}
	render() {
		return (
			<nav className="navbar navbar-dark fixed-top navbar-expand-lg">
				<Link className="navbar-brand" to="/">Nested D&D</Link>
				<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggle" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>

				{/* ---------- COLLAPSING ------------*/}
				<div className="collapse navbar-collapse" id="navbarToggle">
					<ul className="navbar-nav mr-auto">
						<li className="nav-item">
							<Link className="nav-link mx-3" to="/packs">Packs</Link>
						</li>
					</ul>
					

					<ul className="navbar-nav">

						{!this.context.loggedIn ? (
							<li className="nav-item">
								<Link className="nav-link mx-3" to={"/login"}>Login</Link>
							</li>
						) : (
							<li className="nav-item">
								<Link className="nav-link" onClick={this.props.handleLogout}>
									Logout
								</Link>
							</li>
						)}
					</ul>
					{!this.context.loggedIn ? (
						<form className="form-inline">
						<Link to={"/signup"}>
							<button className="btn btn-dark">Sign up</button>
						</Link>
						</form>
					) : null}
				</div>
			</nav>
		);
	}
}

//<IconDebug show={false} />