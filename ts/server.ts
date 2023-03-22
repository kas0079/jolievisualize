import { Request, Response } from "express";
import * as path from "path";
const express = require("express");
const main = require("./index");

const STANDARD_PORT = 9745;

const app = express();

/**
 * Serve the UI output folder as static assets
 */
app.use("/", express.static(path.join(__dirname, "../", "/web")));

const visfile = process.argv[2];
const port = process.argv[3] ?? STANDARD_PORT;
if (visfile && visfile.endsWith(".json")) {
	/**
	 * GET endpoint for getting the data for visualization
	 */
	app.get("/data", (req: Request, res: Response) => {
		const data = main.getData({
			path: path.join(__dirname, "../", visfile),
		});
		res.write(`const dataFromServer = \`${data}\``);
		res.end();
	});
	app.listen(port, () => {
		console.log(`Running server. Goto http://localhost:${port}`);
	});
}
