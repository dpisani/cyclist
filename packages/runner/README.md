# @cyclist/runner

A CLI tool to orchestrate build steps for your project. Cyclist runs scripts listed in your package.json
in order based on lifecycles that you configure.

## Installation

```bash
npm install -g @cyclist/runner
# or if using yarn
yarn global add @cyclist/runner
```

## Usage

You can list all available lifecycles for a project by running

```bash
cyclist --list
```

Running a lifecycle is done in the terminal:

```bash
cyclist <lifecycle name> [stage name]
```

Cyclist will run stages in the given lifecycle in sequence, in a manner similar to `npm run`. The stage name argument
is optional and will cause Cyclist to only run stages up to and including the one provided.

## Configuration

Configuration for Cyclist can be added to the following places:

- a `cyclist` field in your `package.json`
- `.cyclistrc.json`, `.cyclistrc.yml`, or `.cyclistrc.yaml` files
- exported as a module in a `cyclist.config.js` file

The main component of the config is the `lifecycles` property which is read by the CLI
to find all the available lifecycles. e.g.

```json
{
  "lifecycles": {
    "dev": ["build", "start"],
    "verify": ["lint", "build", "test"]
  }
}
```

Each lifecycle contains the following:

### `stages`

An array of stages. A stage can either be a string name or an object with the following properties:

- `name` The name of the stage that can be referenced using the CLI
- `tasks` _(optional)_ An array of tasks to run in this stage. Defaults to `[<name>]`
- `parallel` _(optional)_ Whether all the tasks in this stage should be run in parallel to each other. Defaults to `false`
- `outputMode` _(optional)_ Sets the default `outputMode` on tasks in this stage. Can be one of the following:
  - `stream` Stream output from tasks directly to the console. _Default_
  - `batch` Wait for a task to complete before sending all its output to the console. _Default when the stage has `parallel: true` set_
  - `ignore` Don't display any console output.

### `tasks`

An array of tasks to be run for a stage. A task can either be a string corresponding to script to run or an object with the following properties:

- `script` The script to run. This must correspond to the name of a script in the package being worked upon
- `outputMode` _(optional)_ How stdio output from this task should be handled. Can be one of the following:
  - `stream` Stream task output directly to the console.
  - `batch` Wait for a task to complete before sending all its output to the console.
  - `ignore` Don't display any console output.

## Example configs

### Parallel tasks

Run your lint and test jobs in parallel before building a dist

```json
{
  "lifecycles": {
    "build-dist": [
      {
        "name": "validate",
        "tasks": ["lint", "test"],
        "parallel": true
      },
      "build"
    ]
  }
}
```
