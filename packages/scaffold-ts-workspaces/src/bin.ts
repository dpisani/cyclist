#!/usr/bin/env node

import yargs = require('yargs');
import { getWorkspacesInfo } from './get-workspaces-info';
import { getAmendments } from './get-amendments';
import * as path from 'path';

const argv = yargs(process.argv.slice(2)).options({
  check: {
    type: 'boolean',
    description: 'List problems instead of auto-fixing them.',
  },
  project: {
    alias: 'p',
    type: 'string',
    description: 'directory of the project to run the lifecycle',
  },
}).argv;

const main = async (): Promise<void> => {
  const workingDir = argv.project ? path.resolve(argv.project) : process.cwd();
  const workspacesInfo = await getWorkspacesInfo(workingDir);

  const requiredAmendments = getAmendments(workspacesInfo);

  if (argv.check) {
    if (requiredAmendments.length > 0) {
      console.log('The following problems were found:');

      for (const amendment of requiredAmendments) {
        console.log(`${amendment.filePath}:`);
        console.log(`${amendment.description}`);
      }

      process.exit(1);
    } else {
      console.log('Workspaces build config is valid!');
      process.exit(0);
    }
  } else {
    console.error('FIX NOT IMPLEMENTED YET');
  }
};

main().catch(e => {
  console.error('Something went wrong while scaffolding.');
  console.error(e);
});
