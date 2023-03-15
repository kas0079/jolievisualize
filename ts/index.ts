import * as exec from "child_process";

const getData = (visfile: { path: string }): string => {
	try {
		const res = exec.execFileSync(
			`${__dirname}/../visualize`,
			[`${visfile.path}`],
			{ timeout: 4000 }
		);
		return res.toString();
	} catch {
		return JSON.stringify({ error: true, file: visfile });
	}
};

const getBuildData = (
	visfile: {
		path: string;
	},
	method: string
): string => {
	try {
		const res = exec.execFileSync(
			`${__dirname}/../visualize`,
			[`${visfile.path}`, `--${method}`],
			{ timeout: 4000 }
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
