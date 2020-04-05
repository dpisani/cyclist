import { Lifecycle } from '../types';
import CyclistLogger, { Logger } from '../logger';
import executeStageDep from './execute-stage';

export interface Dependencies {
  executeStage: typeof executeStageDep;
  logger: Logger;
}

// Runs stages up to and including `lastStageName`
export const executeLifecycle = async (
  {
    lifecycle,
    lastStageName,
    cwd,
  }: {
    lifecycle: Lifecycle;
    lastStageName?: string;
    cwd: string;
  },
  { executeStage, logger }: Dependencies
): Promise<void> => {
  if (
    lastStageName &&
    !lifecycle.stages.some(stage => stage.name === lastStageName)
  ) {
    throw new Error(`${lastStageName}: lifecycle stage not found`);
  }

  for (let stage of lifecycle.stages) {
    if (stage.background && stage.name !== lastStageName) {
      logger.info(`Starting stage ${stage.name} in background`);
      // Don't await the result
      executeStage(stage, cwd, {
        logger,
        stdio: {
          stdout: process.stdout,
          stderr: process.stderr,
        },
      });
    } else {
      logger.info(`Starting stage ${stage.name}`);
      await executeStage(stage, cwd, {
        logger,
        stdio: {
          stdout: process.stdout,
          stderr: process.stderr,
        },
      });
    }

    if (stage.name === lastStageName) {
      break;
    }
  }
};

export default params =>
  executeLifecycle(params, {
    executeStage: executeStageDep,
    logger: new CyclistLogger(),
  });
