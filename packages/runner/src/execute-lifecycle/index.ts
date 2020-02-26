import * as runScript from '@npmcli/run-script';
import { Lifecycle } from '../types';

import executeStageDep from './execute-stage';
import executeStage from './execute-stage';

// Runs stages up to and including `lastStageName`
export const executeLifecycle = async (
  {
    lifecycle,
    lastStageName,
    cwd
  }: {
    lifecycle: Lifecycle;
    lastStageName?: string;
    cwd: string;
  },
  { executeStage }: { executeStage: typeof executeStageDep }
): Promise<void> => {
  if (
    lastStageName &&
    !lifecycle.stages.some(stage => stage.name === lastStageName)
  ) {
    throw new Error(`${lastStageName}: lifecycle stage not found`);
  }

  for (let stage of lifecycle.stages) {
    await executeStage(stage, cwd, {
      stdout: process.stdout,
      stderr: process.stderr
    });

    if (stage.name === lastStageName) {
      break;
    }
  }
};

export default params =>
  executeLifecycle(params, { executeStage: executeStageDep });
