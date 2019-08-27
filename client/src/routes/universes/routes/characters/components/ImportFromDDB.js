import React from "react";

const ImportFromDDB = ({ handleUpdate }) => (
	<form onSubmit={handleUpdate}>
		<div className="form-group">
			<label htmlFor="ddbData">Import from D&D Beyond</label>
			<textarea
				className="form-control"
				id="ddbData"
				name="ddbData"
				placeholder='Go to your D&D Beyond character page, add "/json" to the end of the URL, and copy/paste the data here. For example: https://www.dndbeyond.com/profile/username/characters/0000000/json'
			/>
			<button type="submit" className="btn btn-primary mt-1">
				Import
			</button>
		</div>
	</form>
);
export default ImportFromDDB;
