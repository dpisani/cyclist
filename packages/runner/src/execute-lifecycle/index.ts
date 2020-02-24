import * as runScript from '@npmcli/run-script';
import { Lifecycle } from '../types';

// Runs stages up to and including `stageName`
export default async ({
  lifecycle,
  stageName,
  cwd
}: {
  lifecycle: Lifecycle;
  stageName: string;
  cwd: string;
}): Promise<void> => {
  if (!lifecycle.stages.includes(stageName)) {
    throw new Error(`${stageName}: lifecycle stage not found`);
  }

  for (let stage of lifecycle.stages) {
    await runScript({
      event: stage,
      path: cwd,
      stdio: 'inherit'
    });

    if (stage === stageName) {
      break;
    }
  }
};
