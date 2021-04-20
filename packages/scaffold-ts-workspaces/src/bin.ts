#!/usr/bin/env node

import yargs = require('yargs');
import { getWorkspacesInfo } from './get-workspaces-info';
import { getAmendments } from './get-amendments';
import * as path from 'path';

const argv = yargs(process.argv.slice(2)).options({
  validate: {
    type: 'boolean',
    description: 'List problems instead of auto-fixing them.',
  },
  project: {
    alias: 'p',
    type: 'string',
    description: 'Directory of the project to check.',
  },
  checkExisting: {
    type: 'boolean',
    description: 'Only check workspaces that have an existing tsconfig.json.',
  },
  verbose: {
    alias: 'v',
    type: 'boolean',
    description: 'Show detailed information when listing problems.',
  },
}).argv;

const main = async (): Promise<void> => {
  const workingDir = argv.project ? path.resolve(argv.project) : process.cwd();
  const workspacesInfo = await getWorkspacesInfo(workingDir, {
    checkExisting: argv.checkExisting,
  });

  const requiredAmendments = getAmendments(workspacesInfo);

  if (argv.validate) {
    if (requiredAmendments.length > 0) {
      console.log('The following problems were found:');

      for (const amendment of requiredAmendments) {
        console.log();
        console.log(`${amendment.filePath}:`);
        console.log(`${amendment.description}`);
        if (argv.verbose) {
          console.log(
            'Expected value: ',
            JSON.stringify(amendment.desiredValue)
          );
        }
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
