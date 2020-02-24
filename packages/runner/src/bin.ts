#!/usr/bin/env node

import * as path from 'path';
import * as yargs from 'yargs';
import getConfig from './get-config';
import getLifecycle from './get-lifecycle';
import executeLifecycle from './execute-lifecycle';

yargs
  .command(
    '$0 <lifecycle> [stage]',
    'Execute a lifecycle up to a given stage',
    () => {},
    async argv => {
      const { lifecycle: lifecycleName, stage, project: projectDir } = argv;

      const cwd = projectDir
        ? path.resolve(projectDir as string)
        : process.cwd();

      const config = await getConfig(cwd);
      const lifecycle = getLifecycle(lifecycleName as string, config);

      if (!lifecycle) {
        console.error(`Could not find lifecycle ${lifecycleName}`);
        process.exitCode = 1;
        return;
      }

      executeLifecycle({
        lifecycle,
        stageName: stage as string | undefined,
        cwd
      });
    }
  )
  .option('project', {
    alias: 'p',
    type: 'string',
    description: 'directory of the project to run the lifecycle'
  })
  .demandCommand().argv;
