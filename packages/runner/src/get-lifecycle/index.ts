import { Lifecycle, LifecycleStage, LifecycleTask, OutputMode } from '../types';
import {
  CyclistConfiguration,
  LifecycleConfig,
  LifecycleTaskConfig,
  LifecycleStageConfig,
  LifecycleStagesList,
} from '@cyclist/schema';

// Converts a user supplied config into a complete config with the correct defaults

const convertToTask = (
  taskCfg: string | LifecycleTaskConfig,
  defaultOutputMode: OutputMode
): LifecycleTask => {
  if (typeof taskCfg === 'string') {
    return {
      script: taskCfg,
      outputMode: defaultOutputMode,
    };
  }

  return {
    outputMode: defaultOutputMode,
    ...taskCfg,
  };
};

const convertToStage = (
  stageCfg: string | LifecycleStageConfig
): LifecycleStage => {
  if (typeof stageCfg === 'string') {
    return {
      name: stageCfg,
      tasks: [convertToTask(stageCfg, 'stream')],
      parallel: false,
    };
  }

  let defaultOutputMode: OutputMode = 'stream';
  if (stageCfg.outputMode) {
    defaultOutputMode = stageCfg.outputMode;
  }

  const tasks: LifecycleTask[] = stageCfg.tasks
    ? stageCfg.tasks.map(t => convertToTask(t, defaultOutputMode))
    : [convertToTask(stageCfg.name, defaultOutputMode)];

  return {
    // defaults
    parallel: false,
    // apply config over defaults
    ...stageCfg,
    tasks,
  };
};

const convertToLifecycle = (
  lifecycleCfg: LifecycleConfig | LifecycleStagesList
): Lifecycle => {
  const configStages = Array.isArray(lifecycleCfg)
    ? lifecycleCfg
    : lifecycleCfg.stages;

  const stages = configStages.map(s => convertToStage(s));

  return {
    stages,
  };
};

export default (
  lifecycleName: string,
  config: CyclistConfiguration
): Lifecycle | null => {
  const lifecycleCfg = config.lifecycles && config.lifecycles[lifecycleName];
  if (lifecycleCfg) {
    return convertToLifecycle(lifecycleCfg);
  }

  return null;
};

export const getAllLifecycles = (
  config: CyclistConfiguration
): { [name: string]: Lifecycle } => {
  const lifecycles = {};

  for (const lifecycleName in config.lifecycles) {
    lifecycles[lifecycleName] = convertToLifecycle(
      config.lifecycles[lifecycleName]
    );
  }

  return lifecycles;
};
