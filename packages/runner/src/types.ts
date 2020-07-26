export type OutputMode = 'stream' | 'batch' | 'ignore';

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
