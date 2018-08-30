import React from "react";

import Characters from '../Characters/Characters';
import { toUpper } from '../../util/util';

const NavItem = ({label, active}) => (
	<li className="nav-item">
		<a className={`nav-link ${active===label ? 'active' : ''}`} id={`${label}-tab`} 
			href={'#'+label} data-toggle="tab"
			aria-controls={label} aria-selected={active===label} role="tab">
			{toUpper(label)}
		</a>
	</li>
);

const TabPane = ({label, active, component = null}) => (
	<div className={`tab-pane fade ${active===label ? 'show active' : ''}`} id={label} role="tabpanel" aria-labelledby={`${label}-tab`}>
		<h2>{toUpper(label)}</h2>
		{component}
	</div>
);

const EditUniverse = ({title, _id, handleSave, handleDelete, tab = 'generators'}) => (
	<div className="main">
		<div className="mt-5 container">
			<form onSubmit={handleSave}>
				<div className="form-group">
					<label>Title</label>
					<input id="title" name="title" className="form-control" defaultValue={title} />
				</div>
				<button className="btn btn-primary" type="submit">Save</button>
				&nbsp;&nbsp;
				<button className="btn btn-outline-danger" type="button" onClick={handleDelete}>
					<i className="fas fa-trash" /> Delete
				</button>
			</form>

			<ul className="nav nav-tabs" role="tablist">
				<NavItem label="generators" active={tab} />
				<NavItem label="tables" active={tab} />
				<NavItem label="characters" active={tab} />
			</ul>
			
			<div className="tab-content">
				<TabPane label="generators" active={tab} />
				<TabPane label="tables" active={tab} />
				<TabPane label="characters" active={tab} component={<Characters universe_id={_id} />}/>
			</div>

		</div>
	</div>
);

export default EditUniverse;
