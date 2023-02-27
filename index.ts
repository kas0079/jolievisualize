import * as exec from "child_process";

const getData = (
	visfile: {
		path: string;
	}[]
): string => {
	const res = exec.execFileSync(
		`${__dirname}/visualize`,
		[`${visfile[0].path}`],
		{ timeout: 4000 }
	);
	if (!res) return `ERROR`;
	return res.toString();
};

const getBuildData = (
	visfile: {
		path: string;
	}[],
	method: string
): string => {
	const res = exec.execFileSync(
		`${__dirname}/visualize`,
		[`${visfile[0].path}`, `--${method}`],
		{ timeout: 4000 }
	);
	if (!res) return `ERROR`;
	return res.toString();
};

module.exports = {
	getData,
	getBuildData,
};
