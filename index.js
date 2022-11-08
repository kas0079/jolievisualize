import proc from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";
export const __dirname = dirname(fileURLToPath(import.meta.url));

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

export const getData = async (visfile) => {
	if (!checkForJolie()) return "Jolie is not installed correctly";
	const res = await promisedExec(`${__dirname}/visualize ${visfile}`);
	if (res.error || res.stderr) return `ERROR ${res.stderr}`;
	return res.stdout;
};
