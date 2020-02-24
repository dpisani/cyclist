# Cyclist: Build lifecycles for JS projects 🚴

Cyclist makes it easier to build, test and run your code by ensuring all the necessary build steps needed
to achieve something are run in the right sequence every time. This can be especially useful when your code needs
to be compiled before it can be run by node or other tooling.

## Getting started

The main way to use Cyclist is via the CLI:

```bash
npm install -g @cyclist/runner
# or if using yarn
yarn global add @cyclist/runner
```

Cyclist works by executing your npm scripts in a defined order, called a _lifecycle_. These would normally
correspond to common workflows when working in your project. For example, a lifecycle for building and publishing a package
might look like:

```
clean -> lint -> build -> publish
```

We can configure this lifecycle by defining it in our `package.json`:

```json
{
  "cyclist": {
    "lifecycles": {
      "package": {
        "stages": ["clean", "lint", "build", "publish"]
      }
    }
  }
}
```

Then, in the terminal we can run

```bash
cyclist package publish
```

which will run the corresponding `scripts` in our `package.json` for all the stages in the `package` lifecycle up to and including
the `publish` stage. We can also execute a lifecycle part-way by providing the name of a different stage, which will only run stages
up to and including the one specified, e.g.

```bash
cyclist package build
```

will run only the `clean`, `lint`, and `build` scripts. This can be useful to verify the output of different parts of the lifecycle and
to facilitate different needs throughout the development flow.

More details about using and configuring lifecycle runner CLI can be found in the [@cyclist/runner docs](./packages/runner/README.md)

## Inspiration

- [Preconstruct](https://github.com/preconstruct/preconstruct) - a great tool for a smooth workflow in monorepos
- [Maven](https://maven.apache.org/) - just because it's old doesn't mean it's bad
