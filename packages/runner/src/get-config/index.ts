import { cosmiconfig } from 'cosmiconfig';

import getConfig from './main';
import validateConfig from './validate-config';

export default (cwd: string) => getConfig(cwd, { cosmiconfig, validateConfig });
