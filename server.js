#!/usr/bin/env node

import express from "express";
import { getData, __dirname } from "./index.js";
import path from "path";
const app = express();
app.use(express.static(`${__dirname}/web/`));

const filename = process.argv[2];
const data = await getData(path.resolve(filename));

const port = 3000;

app.get("/data", async (req, res) => {
	if (data.startsWith("ERROR")) res.send({ error: data });
	else res.send(`const data = \`${data}\``);
	res.end();
});

app.listen(port, () => {
	console.log(`Opened server at http://localhost:${port}`);
});
