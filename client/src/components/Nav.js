import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Navbar, Nav as NavList, Button,NavItem } from "react-bootstrap";

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
						<NavItem componentClass={Link} to="/packs">Packs</NavItem>
					</NavList>
					{!this.context.loggedIn ? (
						<Navbar.Form pullRight>
							<Link to={"/signup"}>
								<Button>Sign up</Button>
							</Link>
						</Navbar.Form>
					) : null}
					<NavList pullRight>
						

						{!this.context.loggedIn ? (
							<NavItem componentClass={Link} to={"/login"}>Login</NavItem>
						) : (
							<NavItem componentClass={Link} onClick={this.props.handleLogout}>
								Logout
							</NavItem>
						)}
					</NavList>
					
				</Navbar.Collapse>
			</Navbar>
		);
	}
}

//<IconDebug show={false} />