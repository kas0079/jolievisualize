import proc from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

function promisedExec(exec) {
	return new Promise((resolve) => {
		proc.exec(exec, (error, stdout, stderr) => {
			resolve({ error, stdout, stderr });
		});
	});
}

async function checkForJolie() {
	const res = await promisedExec(`jolie --version`);
	if (res.error) return false;
	return true;
}

export async function getData(visfile) {
	if (!checkForJolie()) return "Jolie is not installed correctly";
	const res = await promisedExec(`${__dirname}/visualize ${visfile}`);
	if (res.error) return `ERROR ${res.stderr}`;
	return res.stdout;
}
