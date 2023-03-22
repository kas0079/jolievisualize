# Jolievisualize

This tools is used to visualize, refactor and build [Jolie](https://www.jolie-lang.org) projects. The tool is primarily an extension to a [vscode plugin](https://www.google.com) so installing this tool seperately is not recommended, since the refactoring capabilities is not supported without the vscode plugin. The visualization and building is still supported using this without the vscode plugin.

![Jolievisualize vscode example](https://i.imgur.com/KlO4bKw.png)

## Installation

Installing the vscode plugin automatically installs this package, but if the tool should be installed without the vscode plugin:

Using NPM:

```bash
npm install @ovcina/jolievisualize
```

## Usage

If this tool is being used with the [vscode plugin](https://www.google.com) go to the plugin README, else keep reading:

### Commands

#### Visualize

```bash
npx jolievisualize <path/to/visualize.json>
```

#### Build

```bash
npx jvbuild <path/to/visualize.json> [path/to/buildfolder] [method]
```

Default build folder: `./build`

Default build method: `docker-compose`

## Dependencies

When the tool is being used without the vscode plugin, express is used to serve the UI as static assets and an endpoint, `/data`, is used to get the project data needed for visualization.
