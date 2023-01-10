const proc = require("child_process");

const promisedExec = (exec) => {
	return new Promise((resolve) => {
		proc.exec(exec, (error, stdout, stderr) => {
			resolve({ error, stdout, stderr });
		});
	});
};

const checkForJolie = async () => {
	const res = await promisedExec(`jolie --version`);
	if (res.error) return false;
	return true;
};

const getData = async (visfile, notExtension = true) => {
	if (!checkForJolie()) return "Jolie is not installed correctly";
	const res = await promisedExec(
		`${__dirname}/visualize ${notExtension ? visfile : visfile[0].path}`
	);
	if (res.error || res.stderr) return `ERROR ${res.stderr}`;
	return res.stdout;
};

module.exports = {
	getData,
};
