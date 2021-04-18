#!/usr/bin/env node

import yargs = require('yargs');
import { getAmendments } from './get-amendments';

yargs.command(
  'check',
  'Checks that all workspaces are correctly configured to be compiled with TypeScript.',
  () => {
    /*no command builder*/
  },
  async argv => {
    // await getAmendments();
  }
);
