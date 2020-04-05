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
  tasks?: (string | LifecycleTaskConfig)[];
  parallel?: boolean;
  background?: boolean;
}

export type OutputMode = 'stream' | 'batch' | 'ignore';

export interface LifecycleTaskConfig {
  script: string;
  // Controls how stdio output is displayed for this task
  outputMode?: OutputMode;
}

export interface Lifecycle {
  stages: LifecycleStage[];
}

export interface LifecycleStage {
  name: string;
  tasks: LifecycleTask[];
  parallel: boolean;
  background: boolean;
}

export interface LifecycleTask {
  script: string;
  outputMode: OutputMode;
}
