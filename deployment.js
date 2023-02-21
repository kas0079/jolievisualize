"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const exec = __importStar(require("child_process"));
const dockerComposeBuild = (visFile, buildRoot) => {
    const buildJson = getDockerComposeData(visFile);
    const build = JSON.parse(buildJson);
    fs.writeFileSync(path.join(buildRoot, "docker-compose.yml"), build.deployment);
    return build;
};
const makeDeploymentFolders = (args) => {
    const visFile = args[0] ?? "./visualize.json";
    const buildRoot = args[1] ?? "./build";
    const deployMethod = args[2] ?? "dockercompose";
    if (fs.existsSync(buildRoot))
        fs.rmSync(buildRoot, { recursive: true });
    fs.mkdirSync(buildRoot, { recursive: true });
    let build;
    switch (deployMethod) {
        case "dockercompose":
            build = dockerComposeBuild(visFile, buildRoot);
            break;
        case "kubernetes":
            break;
    }
    if (!build)
        return;
    build.folders.forEach((folder) => {
        fs.mkdirSync(path.join(buildRoot, folder.name), { recursive: true });
        if (fs.existsSync(path.join(path.dirname(visFile), "package.json")))
            fs.cpSync(path.join(path.dirname(visFile), "package.json"), path.join(buildRoot, folder.name, "package.json"), { recursive: true });
        const mainPath = path.join(path.dirname(visFile), folder.main);
        fs.cpSync(mainPath, path.join(buildRoot, folder.name, folder.main), {
            recursive: true,
        });
        folder.files.forEach((file) => {
            const OLPath = path.join(path.dirname(visFile), file);
            fs.cpSync(OLPath, path.join(buildRoot, folder.name, file), {
                recursive: true,
            });
        });
        const dockerFileContent = makeDockerfile(folder);
        fs.writeFileSync(path.join(buildRoot, folder.name, "Dockerfile"), dockerFileContent);
    });
};
const getDockerComposeData = (visfile) => {
    const res = exec.execFileSync(`${__dirname}/scripts/dockercompose`, [`${visfile}`], { timeout: 4000 });
    if (!res)
        return `ERROR`;
    return res.toString();
};
const makeDockerfile = (folder) => {
    return `FROM jolielang/jolie\n${folder.expose
        ? "EXPOSE " + folder.expose.map((t) => t + " ") + "\n"
        : ""}COPY . .\nCMD jolie ${folder.params ? "--params " + folder.params : ""} ${folder.main}`;
};
if (process.argv.length < 3) {
    console.log("Need input arguments.");
    process.exit(1);
}
makeDeploymentFolders(process.argv.slice(2));
