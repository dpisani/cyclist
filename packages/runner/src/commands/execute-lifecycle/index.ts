import getConfig from '../../get-config';
import getLifecycle from '../../get-lifecycle';
import executeLifecycle from '../../execute-lifecycle';

export default async (
  cwd: string,
  { lifecycleName, stageName }: { lifecycleName: string; stageName?: string }
): Promise<void> => {
  const config = await getConfig(cwd);
  const lifecycle = getLifecycle(lifecycleName as string, config);

  if (!lifecycle) {
    throw new Error(`Could not find lifecycle ${lifecycleName}`);
  }

  try {
    await executeLifecycle({
      lifecycle,
      lastStageName: stageName,
      cwd,
    });
  } catch (e) {
    process.exitCode = 1;
    return;
  }
};
