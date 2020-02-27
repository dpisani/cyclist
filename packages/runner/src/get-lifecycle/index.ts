import {
  Config,
  Lifecycle,
  LifecycleConfig,
  LifecycleStage,
  LifecycleStageConfig,
} from '../types';

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
      tasks: [stageCfg],
      parallel: false,
      background: false,
    };
  }

  return {
    // defaults
    tasks: [stageCfg.name],
    parallel: false,
    background: false,
    // apply config over defaults
    ...stageCfg,
  };
};
