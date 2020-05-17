export interface Config {
  lifecycles: {
    [name: string]: LifecycleConfig | LifecycleStagesList;
  };
}

export type LifecycleStagesList = (string | LifecycleStageConfig)[];

export interface LifecycleConfig {
  stages: LifecycleStagesList;
}

export type OutputMode = 'stream' | 'batch' | 'ignore';

export interface LifecycleStageConfig {
  name: string;
  tasks?: (string | LifecycleTaskConfig)[];
  parallel?: boolean;
  // Sets the default output mode for tasks in this stage
  outputMode?: OutputMode;
}

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
}

export interface LifecycleTask {
  script: string;
  outputMode: OutputMode;
}
