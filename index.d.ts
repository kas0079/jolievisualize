declare module "jolievisualize";

type BuildInfo = {
	deployment: string;
	folders: Folder[];
};

type Folder = {
	name: string;
	target: string;
	main: string;
	expose?: number[];
	args?: string;
	files: string[];
	params?: string;
	volumes?: string[];
};

type BuildMethod = "docker-compose" | "kubernetes";
