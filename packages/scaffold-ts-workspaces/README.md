# @cyclist/scaffold-ts-workspaces

Automatically sets up TypeScript project references for building packages within npm or yarn workspaces.

## What it looks for

This scaffold provides checks and auto-fixes for:

- making sure your project can be built with TypeScript's [build mode](https://www.typescriptlang.org/docs/handbook/project-references.html#build-mode-for-typescript)
- ensuring package dependencies between yarn/npm workspaces are also reflected within the tsconfig's [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) section
