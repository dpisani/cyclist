import {
  Config,
  Lifecycle,
  LifecycleConfig,
  LifecycleStage,
  LifecycleStageConfig,
  LifecycleTask,
  LifecycleTaskConfig,
  OutputMode,
} from '../types';

// Converts a user supplied config into a complete config with the correct defaults

export default (lifecycleName: string, config: Config): Lifecycle | null => {
  if (config.lifecycles[lifecycleName]) {
    return convertToLifecycle(config.lifecycles[lifecycleName]);
  }

  return null;
};

const convertToLifecycle = (lifecycleCfg: LifecycleConfig): Lifecycle => {
  const stages = lifecycleCfg.stages.map(s => convertToStage(s));

  return {
    stages,
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
  if (stageCfg.parallel) {
    defaultOutputMode = 'batch';
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
