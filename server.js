#!/usr/bin/env node
const express = require("express");
const index = require("./index");
const path = require("path");

const app = express();
app.use(express.static(`${__dirname}/web/`));

const filename = process.argv[2];
const data = index.getData(path.resolve(filename)).then((d) => {
	console.log(d);
});

const port = 3000;

app.get("/data", async (req, res) => {
	await data;
	if (data.startsWith("ERROR")) res.send({ error: data });
	else res.send(`const data = \`${data}\``);
	res.end();
});

app.listen(port, () => {
	console.log(`Opened server at http://localhost:${port}`);
});
