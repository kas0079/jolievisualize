import * as exec from "child_process";

const getData = (visfile: string | uri[], notExtension = true): string => {
	const res = exec.execFileSync(
		`${__dirname}/scripts/visualize`,
		[`${notExtension ? visfile : (visfile[0] as uri).path}`],
		{ timeout: 4000 }
	);
	if (!res) return `ERROR`;
	return res.toString();
};

module.exports = {
	getData,
};

type uri = {
	path: string;
};
