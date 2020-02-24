import { Config, Lifecycle } from '../types';

export default (lifecycleName: string, config: Config): Lifecycle | null => {
  if (config.lifecycles[lifecycleName]) {
    return config.lifecycles[lifecycleName];
  }

  return null;
};
