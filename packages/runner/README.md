# @cyclist/runner

A CLI tool to orchestrate build steps for your project.

## Installation

```bash
npm install -g @cyclist/runner
# or if using yarn
yarn global add @cyclist/runner
```

# Configuration

Configuration for Cyclist can be added to the following places:

- a `cyclist` field in your `package.json`
- `.cyclistrc.json`, `.cyclistrc.yml`, or `.cyclistrc.yaml` files
- exported as a module in a `cyclist.config.js` file

The main component of the config is the `lifecycles` property which is read by the CLI
to find all the available lifecycles.

```json
{
  "lifecycles": {
    "dev": {
      "stages": ["build", "start"]
    },
    "verify": {
      "stages": ["lint", "build", "test"]
    }
  }
}
```

Each lifecycle contains the following:

### `stages`

An array of stages. A stage can either be a string name or an object with the following properties:

- `name` The name of the stage that can be referenced using the CLI
- `tasks` _(optional)_ An array of strings with all the scripts to run in this stage. Defaults to `[<name>]`
- `parallel` _(optional)_ Whether all the tasks in this stage should be run in parallel to each other. Defaults to `false`

# Usage

Running a lifecycle is done in the terminal:

```bash
cyclist <lifecycle name> [stage name]
```

Cyclist will run stages in the given lifecycle in sequence, in a manner similar to `npm run`. The stage name argument
is optional and will cause Cyclist to only run stages up to and including the one provided.
