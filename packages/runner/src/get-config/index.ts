import { cosmiconfig } from 'cosmiconfig';

import getConfig from './main';
import validateConfig from './validate-config';
import { CyclistConfiguration } from '@cyclist/schema';

export default (cwd: string): Promise<CyclistConfiguration> =>
  getConfig(cwd, { cosmiconfig, validateConfig });
