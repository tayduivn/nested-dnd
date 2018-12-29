import React, { Component } from "react";
import PropTypes from "prop-types";

import "./Login.css";

const DisplayLogin = ({
	title,
	handleSubmit,
	emailValid,
	handleChange,
	email,
	emailError,
	passwordValid,
	password,
	passwordError,
	password2,
	password2Valid,
	password2Error
}) => (
	<div className="main ">
		<div className="container mt-5 loginForm">
			<h1 className="mb-1">{title}</h1>
			<form onSubmit={handleSubmit}>
				<div className="form-group" name="email">
					<label htmlFor="login_email">Email</label>
					<input
						id="login_email"
						name="email"
						className={`form-control ${
							emailValid === false ? "is-invalid" : ""
						}`}
						type="email"
						aria-describedby="emailHelp"
						placeholder="email"
						value={email}
						onChange={handleChange}
						required
					/>
					<small id="emailHelp" className="invalid-feedback">
						{emailError}
					</small>
				</div>
				<div className="form-group" name="password">
					<label htmlFor="first_password">Password</label>
					<input
						id="first_password"
						type="password"
						placeholder="password"
						name="password"
						className={`form-control ${
							passwordValid === false ? "is-invalid" : ""
						}`}
						autoComplete="new-password"
						aria-describedby="pwHelp"
						value={password}
						onChange={handleChange}
						minLength="8"
						required
					/>
					<small id="pwHelp" className="invalid-feedback">
						{passwordError}
					</small>
				</div>
				{title === "Login" ? null : (
					<div className="form-group" name="confim_password">
						<label htmlFor="confim">Confim password</label>
						<input
							id="confim"
							type="password"
							placeholder="password"
							name="password2"
							className={`form-control ${
								password2Valid === false ? "is-invalid" : ""
							}`}
							autoComplete="new-password"
							aria-describedby="pwHelp"
							value={password2}
							onChange={handleChange}
							minLength="8"
							required
						/>
						<small id="pwHelp" className="invalid-feedback">
							{password2Error}
						</small>
					</div>
				)}
				<button type="submit" className="btn btn-default">
					Submit
				</button>
			</form>
		</div>
	</div>
);

export default class Login extends Component {
	state = {
		email: "",
		emailValid: null,
		emailError: null,
		password: "",
		passwordValid: null,
		passwordError: null,
		password2: "",
		password2Valid: null,
		password2Error: null,
		submitted: false
	};

	static propTypes = {
		title: PropTypes.string,
		handleLogin: PropTypes.func,
		loggedIn: PropTypes.bool
	};

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
			[e.target.name + "Valid"]: null,
			[e.target.name + "Error"]: null,
			submitted: false
		});
	}
	handleSubmit(e) {
		e.preventDefault();

		if (
			this.props.title !== "Login" &&
			this.state.password !== this.state.password2
		) {
			this.setState({
				password2Valid: false,
				password2Error: "Passwords do not match"
			});
			return;
		}

		const payload = {
			email: this.state.email,
			password: this.state.password
		};

		this.props
			.handleLogin(this.props.location.pathname, payload)
			.then(({ error, data: json }) => {
				let newState = {
					emailValid: json && json.emailError ? false : null,
					emailError: json && json.emailError,
					passwordValid: json && json.passwordError ? false : null,
					passwordError: json && json.passwordError,
					submitted: true
				};
				this.setState(newState);
			});
	}
	render() {
		if (
			this.props.loggedIn ||
			(!this.state.emailError &&
				!this.state.passwordError &&
				this.state.submitted)
		) {
			this.props.history.goBack();
			return null;
		}

		return (
			<DisplayLogin
				{...this.props}
				{...this.state}
				handleSubmit={this.handleSubmit}
				handleChange={this.handleChange}
			/>
		);
	}
}
