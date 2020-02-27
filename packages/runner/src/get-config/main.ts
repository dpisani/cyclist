import { cosmiconfig as cosmiconfigModule } from 'cosmiconfig';
import { Config } from '../types';

const CONFIG_MODULE_NAME = 'cyclist';

export default async (
  cwd: string,
  {
    cosmiconfig,
    validateConfig,
  }: {
    cosmiconfig: typeof cosmiconfigModule;
    validateConfig: (
      config: unknown
    ) => { isValid: boolean; messages: string[] };
  }
): Promise<Config> => {
  const configExplorer = cosmiconfig(CONFIG_MODULE_NAME);
  const result = await configExplorer.search(cwd);

  const configValidation = validateConfig(result?.config);

  if (configValidation.isValid) {
    return result?.config;
  }

  throw configValidation;
};
