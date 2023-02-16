const { execFileSync } = require("child_process");

const getData = (visfile, notExtension = true) => {
	const res = execFileSync(
		`${__dirname}/visualize`,
		[`${notExtension ? visfile : visfile[0].path}`],
		{ timeout: 4000 }
	);
	if (!res) return `ERROR`;
	return res.toString();
};

const getDockerComposeData = (visfile, notExtension = true) => {
	const res = execFileSync(
		`${__dirname}/deployment`,
		[`${notExtension ? visfile : visfile[0].path}`],
		{ timeout: 4000 }
	);
	if (!res) return `ERROR`;
	return res.toString();
};

module.exports = {
	getData,
	getDockerComposeData,
};
