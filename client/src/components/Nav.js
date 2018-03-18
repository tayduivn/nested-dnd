import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Navbar, Nav as NavList, Button } from "react-bootstrap";

import { IconDebug } from "./ThingExplorer/IconDebug.js";

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
			<Navbar id="navbar" inverse collapseOnSelect fixedTop fluid>
				<Navbar.Header>
					<Navbar.Brand>
						<Link to="/">Nested D&D</Link>
					</Navbar.Brand>
				</Navbar.Header>
				<Navbar.Collapse>
					<NavList>
						<li>
							<Link to={process.env.PUBLIC_URL + "/packs"}>Packs</Link>
						</li>
					</NavList>
					{!this.context.loggedIn ? (
						<Navbar.Form pullRight>
							<Link to={"/signup"}>
								<Button>Sign up</Button>
							</Link>
						</Navbar.Form>
					) : null}
					<NavList pullRight>
						<IconDebug show={false} />

						{!this.context.loggedIn ? (
							<li>
								<Link to={"/login"}>Login</Link>
							</li>
						) : (
							<li>
								<a onClick={this.props.handleLogout}>Logout</a>
							</li>
						)}
					</NavList>
					
				</Navbar.Collapse>
			</Navbar>
		);
	}
}