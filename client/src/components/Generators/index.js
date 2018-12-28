import Generators, { GeneratorsList } from "./Generators";
import Generator from "./Generator";
import EditGenerator from "./EditGenerator";

const routes = [
	{
		path: "/create",
		isCreate: true,
		private: true,
		component: EditGenerator
	},
	{
		path: "/:generator",
		component: Generator,
		routes: [
			{
				path: "/edit",
				private: true,
				component: EditGenerator
			}
		]
	}
];

export default Generators;
export { GeneratorsList, Generator, EditGenerator, routes };
