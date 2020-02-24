export interface LifecycleConfig {
  stages: string[];
}

export interface Config {
  lifecycles: {
    [name: string]: LifecycleConfig;
  };
}

export interface Lifecycle {
  stages: string[];
}
