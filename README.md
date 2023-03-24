# Jolievisualize

Visualize, refactor and build [Jolie](https://www.jolie-lang.org) projects!

The tool is primarily an extension to a [vscode plugin](https://github.com/EmilOvcina/vscode-jolievisualize) so installing this tool separately is not recommended since the refactoring capabilities are not supported without the vscode plugin. Visualization and building are still supported using this without the vscode plugin.

![Jolievisualize vscode example](https://i.imgur.com/KlO4bKw.png)

## Installation

Installing the vscode plugin automatically installs this package, but if the tool should be installed without the vscode plugin:

Using NPM:

```bash
npm install @ovcina/jolievisualize
```

## Usage

If this tool is being used with the [vscode plugin](https://github.com/EmilOvcina/vscode-jolievisualize) go to the plugin README, else keep reading:

### Setting up the visualization config file

Create a file called `visualize.jolie.json` at the root of the project. Paste this skeleton config JSON into the file:

```JSON
[
    [
        {"file":"svc.ol", "target":"name", "instances":1}
    ]
]
```

Change the name and file name to a relevant service name the file which contains the service.

Further configurations of the visualization file can be found under the _Visualize JSON File Structure_ section

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

## Visualize JSON File Structure

The file contains an array of arrays of services. Each array in the enveloping array represents a network.

Example:

```JSON
[
    [
        {...}, {...}
    ],
    [
        {...}
    ]
]
```

This means that there are _two_ networks where the first contains two services and the second contains one service.

### Service Fields

Here is a table of possible fields for a service:

| **Field** | **Description**                                                                     | **Type**       | **Example**                                       |
| --------- | ----------------------------------------------------------------------------------- | -------------- | ------------------------------------------------- |
| file      | The location of a Jolie file relative to the visualization file                     | String         | `main.ol`                                         |
| target    | Name of the service in the file                                                     | String         | `MainService`                                     |
| name      | Name of the service in the file                                                     | String         | `MainService`                                     |
| instances | Number of instances of the service to be visualized                                 | Long           | `2`                                               |
| container | Name of the container in the deployment yaml file                                   | String         | `MainContainer`                                   |
| args      | Jolie arguments which gets added to the Dockerfile after building                   | String         | `--connlimit 10 --stackTraces`                    |
| params    | Either path to a JSON file containing service parameters, or the parameters as JSON | String or JSON | `params.json` or `{ location: "localhost:3432" }` |
| env       | Deployment environment variables. Gets added in the deployment yaml file            | JSON           | `{ username: "test", password: "123" }`           |
| images    | Specifies a remote image which gets added in the deployment yaml file               | String         | `emilovcina/SomeJolieImage`                       |
| ports     | List of strings defining Docker port mappings                                       | String[]       | `["4000:4000","3444:9000"]`                       |
| volumes   | List of file locations which will get bound as volumes when running the deployment  | String[]       | `["/config.ini","assets/test.txt"]`               |
