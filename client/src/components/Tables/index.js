import Tables from "./Tables";
import Table from "./Table";
import EditTable from "./EditTable";

const routes = [
	{
		path: "/create",
		private: true,
		isCreate: true,
		component: EditTable
	},
	{
		path: "/:table",
		component: Table,
		routes: [
			{
				path: "/edit",
				private: true,
				component: EditTable
			}
		]
	}
];

export default Tables;
export { EditTable, Table, routes };
