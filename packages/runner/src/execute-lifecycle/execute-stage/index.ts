import { Writable } from 'stream';
import * as runScript from '@npmcli/run-script';

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

interface FailedScript {
  script: string;
  code: number;
}

const runTaskScript = async (
  task: LifecycleTask,
  cwd: string,
  { stdio }: Dependencies
): Promise<void> => {
  const { script, outputMode } = task;

  let stdioCfg;
  if (outputMode === 'stream') {
    stdioCfg = ['inherit', stdio.stdout, stdio.stderr];
  } else if (outputMode === 'batch') {
    stdioCfg = ['inherit', 'pipe', 'pipe'];
  } else {
    stdioCfg = ['inherit', 'ignore', 'ignore'];
  }

  const flushOutput = ({
    stdout,
    stderr,
  }: {
    stdout: Buffer;
    stderr: Buffer;
  }): void => {
    // Flush out any piped output
    if (stdioCfg[1] === 'pipe') {
      stdio.stdout.write(stdout);
    }
    if (stdioCfg[2] === 'pipe') {
      stdio.stderr.write(stderr);
    }
  };

  try {
    const { stdout, stderr } = await runScript({
      event: script,
      path: cwd,
      stdio: stdioCfg,
    });

    flushOutput({ stdout, stderr });
  } catch (failedScript) {
    const { stdout, stderr } = failedScript;
    flushOutput({ stdout, stderr });

    throw { task, code: failedScript.code };
  }
};

// When running scripts sequentially, pipe directly to stdio
const runSequentialTasks = async (
  tasks: LifecycleTask[],
  cwd: string,
  { stdio, logger }: Dependencies
): Promise<void> => {
  for (const task of tasks) {
    await runTaskScript(task, cwd, { stdio, logger });
  }
};

//When running multiple scripts in parallel, batch output of each
const runParallelTasks = (
  tasks: LifecycleTask[],
  cwd: string,
  { stdio, logger }: Dependencies
): Promise<void[]> => {
  logger.info(`Starting ${tasks.length} tasks in parallel`);
  const executions = tasks.map(async task => {
    await runTaskScript(task, cwd, { stdio, logger });
  });

  return Promise.all(executions);
};

export default async (
  stage: LifecycleStage,
  cwd: string,
  deps: Dependencies
): Promise<void> => {
  try {
    if (stage.parallel) {
      await runParallelTasks(stage.tasks, cwd, deps);
    } else {
      await runSequentialTasks(stage.tasks, cwd, deps);
    }
  } catch (failedScript) {
    const task: LifecycleTask = failedScript.task;
    deps.logger.error(
      `Task '${task.script}' failed with exit code ${failedScript.code}`
    );

    throw failedScript;
  }
};
