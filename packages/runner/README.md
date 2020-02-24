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

An array of stage names. each of these should have a corresponding entry in the `scripts` field in your
`package.json`

# Usage

Running a lifecycle is done in the terminal:

```bash
cyclist <lifecycle name> <stage name>
```

Cyclist will then run stages in the given lifecycle up to and including the one provided.
