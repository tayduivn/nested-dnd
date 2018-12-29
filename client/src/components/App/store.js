import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import packs from "../Packs/reducers";

const middleware = applyMiddleware(thunk, logger);

const app = combineReducers({
	packs
});

export default createStore(app, {}, middleware);
