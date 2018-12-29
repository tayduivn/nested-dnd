import React from "react";
import { Link } from "../Util";

import "./Nav.css";

const Nav = ({ loggedIn, handleLogout }) => (
	<nav className="navbar navbar-dark navbar-expand-lg">
		<Link className="navbar-brand" to="/">
			Nested D&D
		</Link>
		<button
			className="navbar-toggler"
			type="button"
			data-toggle="collapse"
			data-target="#navbarToggle"
			aria-controls="navbarTogglerDemo01"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span className="navbar-toggler-icon" />
		</button>

		{/* ---------- COLLAPSING ------------*/}
		<div className="collapse navbar-collapse" id="navbarToggle">
			<ul className="navbar-nav mr-auto" />

			<ul className="navbar-nav">
				{!loggedIn ? (
					<li className="nav-item">
						<Link className="nav-link mx-3" to={"/login"}>
							Login
						</Link>
					</li>
				) : (
					<li className="nav-item">
						<button className="nav-link" onClick={handleLogout}>
							Logout
						</button>
					</li>
				)}
			</ul>
			{!loggedIn ? (
				<form className="form-inline">
					<Link to={"/signup"}>
						<button className="btn btn-dark">Sign up</button>
					</Link>
				</form>
			) : null}
		</div>
	</nav>
);

export default Nav;
//<IconDebug show={false} />
