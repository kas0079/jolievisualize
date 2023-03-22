import * as fs from "fs";
import * as path from "path";
const main = require("./index");

/**
 * Checks which build method should be used. Then generates the correct .yaml file content and
 * creates the folders, copies dependencies and makes Dockerfiles.
 * @param visFile object which contains a path to a file. This should be the visualization json file
 * @param buildFolder The foldername of the build
 * @param buildMethod "docker-compose" or "kubernetes"
 * @returns void
 */
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

/**
 * Calls the method from index which runs the Java tool and generates the information about the build.
 * @param visFile object which contains a path to a file. This should be the visualization json file.
 * @param buildRoot build dir folder name.
 * @returns BuildInfo which contains information about the folders in the build dir, and the yaml content
 */
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

/**
 * Makes the Dockerfile content
 * @param folder information about the folder which the Dockerfile should generate an image of
 * @param jpm is the project is using JPM
 * @returns Dockerfile content as string
 */
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

/**
 * Formats the build folder name so the Java tool gets consistent input.
 * @param folder build folder name
 * @returns formatted build folder name
 */
const formatBuildFolder = (folder: string): string => {
	let res = "";
	if (!folder.startsWith("/")) res = "/" + folder;
	if (folder.endsWith("/")) res.substring(0, res.length - 1);
	return res;
};

/**
 * Converts the string input to a supported build method. This assures that the build method get's a valid input
 * @param methodString string input op the build method
 * @returns BuildMethod which, for now, is "docker-compose" or "kubernetes"
 */
const getBuildMethod = (methodString: string): BuildMethod => {
	if (methodString === "kubernetes") return "kubernetes";
	return "docker-compose";
};

/**
 * When the script is run on it's own: Check for CLI args and run the build method.
 */
if (process.argv.length < 3) {
	console.log("Need input arguments.");
	process.exit(1);
}
build(
	{ path: process.argv[2] ?? "visualize.jolie.json" },
	process.argv[3] ?? "build",
	getBuildMethod(process.argv[4] ?? "docker-compose")
);
