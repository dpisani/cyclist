import * as chalk from 'chalk';
import getConfig from '../../get-config';
import { getAllLifecycles } from '../../get-lifecycle';

export default async (cwd: string): Promise<void> => {
  const config = await getConfig(cwd);
  const lifecycles = getAllLifecycles(config);

  console.log('Project lifecycles:\n');

  const output = Object.keys(lifecycles)
    .map(lfName => {
      const lifecycle = lifecycles[lfName];

      const stagesOutput = lifecycle.stages
        .map(s => chalk.cyan(s.name))
        .join(' ');

      return `${chalk.bold.blue(lfName)}
Stages: ${stagesOutput}
`;
    })
    .join('\n');

  console.log(output);
};
