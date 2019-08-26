import actions from "./actions";
import reducers from "./reducers";
import Login from "./Login";
import { connect } from "react-redux";

const mapStateToProps = (state, ownProps) => ({
	loggedIn: state.user.loggedIn,
	error: state.user.error
});

const Container = connect(mapStateToProps)(Login);

export { actions, reducers, Container as Login };
