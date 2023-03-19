import * as fs from "fs";
import * as path from "path";
const main = require("./index");

const build = (
	visFile: { path: string },
	buildFolder: string,
	buildMethod: BuildMethod
): void => {
	if (fs.existsSync(buildFolder)) fs.rmSync(buildFolder, { recursive: true });

	fs.mkdirSync(buildFolder, { recursive: true });

	let build;

	switch (buildMethod) {
		case "docker-compose":
			build = dockerComposeBuild(visFile, buildFolder);
			break;
		case "kubernetes":
			//! not implemented
			break;
	}

	if (!build) return;

	build.folders.forEach((folder) => {
		fs.mkdirSync(path.join(buildFolder, folder.name), { recursive: true });
		let jpm = false;
		if (
			fs.existsSync(
				path.join(
					path.dirname(visFile.path),
					path.dirname(folder.main),
					"package.json"
				)
			)
		) {
			fs.cpSync(
				path.join(
					path.dirname(visFile.path),
					path.dirname(folder.main),
					"package.json"
				),
				path.join(buildFolder, folder.name, "package.json"),
				{ recursive: true }
			);
			jpm = true;
		}

		const mainPath = path.join(path.dirname(visFile.path), folder.main);
		fs.cpSync(mainPath, path.join(buildFolder, folder.name, folder.main), {
			recursive: true,
		});

		folder.files.forEach((file) => {
			const OLPath = path.join(path.dirname(visFile.path), file);
			fs.cpSync(OLPath, path.join(buildFolder, folder.name, file), {
				recursive: true,
			});
		});

		folder.volumes?.forEach((vol) => {
			fs.cpSync(
				path.join(path.join(path.dirname(visFile.path)), vol),
				path.join(buildFolder, "-res", vol),
				{ recursive: true }
			);
		});

		const dockerFileContent = makeDockerfile(folder, jpm);
		fs.writeFileSync(
			path.join(buildFolder, folder.name, "Dockerfile"),
			dockerFileContent
		);
	});
};

const dockerComposeBuild = (
	visFile: { path: string },
	buildRoot: string
): BuildInfo => {
	const buildJson = main.getBuildData(
		visFile,
		"docker-compose",
		formatBuildFolder(buildRoot)
	);
	const build = JSON.parse(buildJson) as BuildInfo;
	fs.writeFileSync(
		path.join(buildRoot, "docker-compose.yml"),
		build.deployment
	);
	return build;
};

const makeDockerfile = (folder: Folder, jpm: boolean): string => {
	return `FROM jolielang/jolie\n${
		folder.expose
			? "EXPOSE " + folder.expose.map((t) => t + " ") + "\n"
			: ""
	}COPY . .\n${jpm ? "RUN jpm install\n" : ""}CMD jolie --service ${
		folder.target
	}${folder.params ? " --params " + folder.params : ""}${
		folder.args ? " " + folder.args : ""
	} ${folder.main}`;
};

const formatBuildFolder = (folder: string): string => {
	let res = "";
	if (!folder.startsWith("/")) res = "/" + folder;
	if (folder.endsWith("/")) res.substring(0, res.length - 1);
	return res;
};

const getBuildMethod = (methodString: string): BuildMethod => {
	if (methodString === "kubernetes") return "kubernetes";
	return "docker-compose";
};

if (process.argv.length < 3) {
	console.log("Need input arguments.");
	process.exit(1);
}
build(
	{ path: process.argv[2] ?? "visualize.jolie.json" },
	process.argv[3] ?? "build",
	getBuildMethod(process.argv[4] ?? "docker-compose")
);
