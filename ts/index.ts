import * as exec from "child_process";

const TIMEOUT = 4000;
const SCRIPT_LOCATION = `${__dirname}/../visualize`;

/**
 * Runs the Java tool and gets the JSON data to visualize.
 * @param visfile object which contains a path to a file. This should be the visualization json file
 * @returns JSON string of the code structure to be visualized.
 */
const getData = (visfile: { path: string }): string => {
	try {
		const res = exec.execFileSync(SCRIPT_LOCATION, [`${visfile.path}`], {
			timeout: TIMEOUT,
		});
		return res.toString();
	} catch {
		return JSON.stringify({ error: true, file: visfile });
	}
};

/**
 * Runs the Java tool and gets the JSON data to build the project.
 * @param visfile object which contains a path to a file. This should be the visualization json file
 * @param method deployment method to build to.
 * @param buildFolder Folder name of the build.
 * @returns JSON string of the build information.
 */
const getBuildData = (
	visfile: {
		path: string;
	},
	method: string,
	buildFolder: string
): string => {
	try {
		const res = exec.execFileSync(
			SCRIPT_LOCATION,
			[`${visfile.path}`, `--${method}`, `--build`, `${buildFolder}`],
			{ timeout: TIMEOUT }
		);
		return res.toString();
	} catch {
		return JSON.stringify({ error: true, file: visfile });
	}
};

module.exports = {
	getData,
	getBuildData,
};
