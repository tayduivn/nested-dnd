import actions from "./actions";
import reducers from "./reducers";
import Login from "./Login";
import { doLogin } from "./actions";
import { connect } from "react-redux";

const mapStateToProps = state => ({
	loggedIn: state.user.loggedIn,
	error: state.user.error
});
const mapDispatchToProps = dispatch => ({
	handleLogin: (url, payload) => doLogin(dispatch, url, payload)
});

const Container = connect(
	mapStateToProps,
	mapDispatchToProps
)(Login);

export { actions, reducers, Container as Login };
