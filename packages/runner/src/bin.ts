#!/usr/bin/env node

import * as path from 'path';
import * as yargs from 'yargs';
import executeLifecycleCommand from './commands/execute-lifecycle';
import listLifecyclesCommand from './commands/list-lifecycles';

yargs
  .command(
    '$0 [lifecycle] [stage]',
    'Execute a lifecycle up to a given stage',
    () => {
      /*no command builder*/
    },
    async argv => {
      const { lifecycle, stage, project: projectDir, list: showList } = argv;

      const cwd = projectDir
        ? path.resolve(projectDir as string)
        : process.cwd();

      if (showList) {
        await listLifecyclesCommand(cwd);
      } else if (lifecycle) {
        await executeLifecycleCommand(cwd, {
          lifecycleName: lifecycle as string,
          stageName: stage as string | undefined,
        });
      } else {
        throw 'No lifecycle provided. Run cyclist --list to show available lifecycles.';
      }
    }
  )
  .option('project', {
    alias: 'p',
    type: 'string',
    description: 'directory of the project to run the lifecycle',
  })
  .option('list', {
    alias: 'l',
    type: 'boolean',
    description: 'Lists available lifecycles and stages',
  }).argv;
