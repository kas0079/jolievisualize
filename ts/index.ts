import * as exec from "child_process";

const TIMEOUT = 4000;
const SCRIPT_LOCATION = `${__dirname}/../visualize`;

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
