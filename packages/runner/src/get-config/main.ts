import { cosmiconfig as cosmiconfigModule } from 'cosmiconfig';
import { CyclistConfiguration } from '@cyclist/schema';

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
): Promise<CyclistConfiguration> => {
  const configExplorer = cosmiconfig(CONFIG_MODULE_NAME);
  const result = await configExplorer.search(cwd);

  const configValidation = validateConfig(result?.config);

  if (configValidation.isValid) {
    return result?.config;
  }

  throw new Error(`There was a problem in your cyclist config:

${configValidation.messages.join('\n')}
`);
};
