import { Writable } from 'stream';
import * as runScript from '@npmcli/run-script';

import { LifecycleStage } from '../../types';

export interface InjectedStdio {
  stdout: Writable | 'ignore';
  stderr: Writable | 'ignore';
}

export default async (
  stage: LifecycleStage,
  cwd: string,
  stdio: InjectedStdio
) => {
  if (stage.parallel) {
    await runParallelTasks(stage.tasks, cwd, stdio);
  } else {
    await runSequentialTasks(stage.tasks, cwd, stdio);
  }
};

// When running scripts sequentially, pipe directly to stdio
const runSequentialTasks = async (
  tasks: string[],
  cwd: string,
  { stdout, stderr }: InjectedStdio
) => {
  for (let script of tasks) {
    await runScript({
      event: script,
      path: cwd,
      stdio: ['inherit', stdout, stderr],
    });
  }
};

//When running multiple scripts in parallel, batch output of each
const runParallelTasks = (
  tasks: string[],
  cwd: string,
  stdio: InjectedStdio
) => {
  const executions = tasks.map(async script => {
    const { stdout, stderr } = await runScript({
      event: script,
      path: cwd,
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    if (stdio.stdout !== 'ignore') {
      stdio.stdout.write(stdout);
    }
    if (stdio.stderr !== 'ignore') {
      stdio.stderr.write(stderr);
    }
  });

  return Promise.all(executions);
};
