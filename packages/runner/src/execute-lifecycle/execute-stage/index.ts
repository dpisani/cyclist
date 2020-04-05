import { Writable } from 'stream';
import * as runScript from '@npmcli/run-script';
import * as chalk from 'chalk';

import { LifecycleStage, OutputMode, LifecycleTask } from '../../types';
import { Logger } from '../../logger';

export interface InjectedStdio {
  stdout: Writable;
  stderr: Writable;
}

export interface Dependencies {
  stdio: InjectedStdio;
  logger: Logger;
}

export default async (
  stage: LifecycleStage,
  cwd: string,
  deps: Dependencies
) => {
  if (stage.parallel) {
    await runParallelTasks(stage.tasks, cwd, deps);
  } else {
    await runSequentialTasks(stage.tasks, cwd, deps);
  }
};

// When running scripts sequentially, pipe directly to stdio
const runSequentialTasks = async (
  tasks: LifecycleTask[],
  cwd: string,
  { stdio, logger }: Dependencies
) => {
  for (let task of tasks) {
    await runTaskScript(task.script, task.outputMode, cwd, { stdio, logger });

    logger.info(`Completed task ${chalk.bold(task)}`);
  }
};

//When running multiple scripts in parallel, batch output of each
const runParallelTasks = (
  tasks: LifecycleTask[],
  cwd: string,
  { stdio, logger }: Dependencies
) => {
  logger.info(`Starting ${tasks.length} tasks in parallel`);
  const executions = tasks.map(async task => {
    await runTaskScript(task.script, task.outputMode, cwd, { stdio, logger });
  });

  return Promise.all(executions);
};

const runTaskScript = async (
  script: string,
  outputMode: OutputMode,
  cwd: string,
  { stdio, logger }: Dependencies
) => {
  let stdioCfg;
  if (outputMode === 'stream') {
    stdioCfg = ['inherit', stdio.stdout, stdio.stderr];
  } else if (outputMode === 'batch') {
    stdioCfg = ['inherit', 'pipe', 'pipe'];
  } else {
    stdioCfg = ['inherit', 'ignore', 'ignore'];
  }

  const { stdout, stderr } = await runScript({
    event: script,
    path: cwd,
    stdio: stdioCfg,
  });

  // Flush out any piped output
  if (stdioCfg[2] === 'pipe') {
    stdio.stdout.write(stdout);
  }
  if (stdioCfg[3] === 'pipe') {
    stdio.stderr.write(stderr);
  }

  logger.info(`Completed task ${chalk.bold(script)}`);
};
