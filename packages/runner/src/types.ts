export interface Config {
  lifecycles: {
    [name: string]: LifecycleConfig;
  };
}

export interface LifecycleConfig {
  stages: (string | LifecycleStageConfig)[];
}

export interface LifecycleStageConfig {
  name: string;
  tasks?: string[];
  parallel?: boolean;
}

export interface Lifecycle {
  stages: LifecycleStage[];
}

export interface LifecycleStage {
  name: string;
  tasks: string[];
  parallel: boolean;
}
