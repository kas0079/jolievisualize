import * as fs from "fs";
import * as path from "path";
import * as exec from "child_process";

const dockerComposeBuild = (visFile: string, buildRoot: string): BuildInfo => {
	const buildJson = getDockerComposeData(visFile);
	const build = JSON.parse(buildJson) as BuildInfo;
	fs.writeFileSync(
		path.join(buildRoot, "docker-compose.yml"),
		build.deployment
	);

	return build;
};

const makeDeploymentFolders = (args: string[]): void => {
	const visFile = args[0] ?? "./visualize.json";
	const buildRoot = args[1] ?? "./build";
	const deployMethod = args[2] ?? "docker-compose";

	if (fs.existsSync(buildRoot)) fs.rmSync(buildRoot, { recursive: true });

	fs.mkdirSync(buildRoot, { recursive: true });

	let build;

	switch (deployMethod) {
		case "docker-compose":
			build = dockerComposeBuild(visFile, buildRoot);
			break;
		case "kubernetes":
			//! not implemented
			break;
	}

	if (!build) return;

	build.folders.forEach((folder) => {
		fs.mkdirSync(path.join(buildRoot, folder.name), { recursive: true });
		if (fs.existsSync(path.join(path.dirname(visFile), "package.json")))
			fs.cpSync(
				path.join(path.dirname(visFile), "package.json"),
				path.join(buildRoot, folder.name, "package.json"),
				{ recursive: true }
			);

		const mainPath = path.join(path.dirname(visFile), folder.main);
		fs.cpSync(mainPath, path.join(buildRoot, folder.name, folder.main), {
			recursive: true,
		});

		folder.files.forEach((file) => {
			const OLPath = path.join(path.dirname(visFile), file);
			fs.cpSync(OLPath, path.join(buildRoot, folder.name, file), {
				recursive: true,
			});
		});

		folder.volumes?.forEach((vol) => {
			fs.cpSync(
				path.join(path.join(path.dirname(visFile)), vol),
				path.join(buildRoot, "-res", vol),
				{ recursive: true }
			);
		});

		const dockerFileContent = makeDockerfile(folder);
		fs.writeFileSync(
			path.join(buildRoot, folder.name, "Dockerfile"),
			dockerFileContent
		);
	});
};

const getDockerComposeData = (visfile: string): string => {
	const res = exec.execFileSync(
		`${__dirname}/../visualize`,
		[`${visfile}`, "--docker-compose"],
		{ timeout: 4000 }
	);
	if (!res) return `ERROR`;
	return res.toString();
};

const makeDockerfile = (folder: Folder): string => {
	return `FROM jolielang/jolie\n${
		folder.expose
			? "EXPOSE " + folder.expose.map((t) => t + " ") + "\n"
			: ""
	}COPY . .\nCMD jolie --service ${folder.target}${
		folder.params ? " --params " + folder.params : ""
	}${folder.args ? " " + folder.args : ""} ${folder.main}`;
};

if (process.argv.length < 3) {
	console.log("Need input arguments.");
	process.exit(1);
}

makeDeploymentFolders(process.argv.slice(2));

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
