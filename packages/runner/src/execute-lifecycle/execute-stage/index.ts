import { Writable } from 'stream';
import * as runScript from '@npmcli/run-script';

import { LifecycleStage } from '../../types';

export interface InjectedStdio {
  stdout: Writable;
  stderr: Writable;
}

export default async (
  stage: LifecycleStage,
  cwd: string,
  stdio: InjectedStdio
) => {
  if (stage.parallel) {
    await runParallelScripts(stage.tasks, cwd, stdio);
  } else {
    await runSequentialScripts(stage.tasks, cwd, stdio);
  }
};

// When running scripts sequentially, pipe directly to stdio
const runSequentialScripts = async (
  scripts: string[],
  cwd: string,
  { stdout, stderr }: InjectedStdio
) => {
  for (let script of scripts) {
    await runScript({
      event: script,
      path: cwd,
      stdio: ['inherit', stdout, stderr]
    });
  }
};

//When running multiple scripts in parallel, batch output of each
const runParallelScripts = (
  scripts: string[],
  cwd: string,
  stdio: InjectedStdio
) => {
  const executions = scripts.map(async script => {
    const { stdout, stderr } = await runScript({
      event: script,
      path: cwd,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    stdio.stdout.write(stdout);
    stdio.stderr.write(stderr);
  });

  return Promise.all(executions);
};
