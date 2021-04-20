import { Package, getPackages } from '@manypkg/get-packages';
import { readJson } from 'fs-extra';
import * as path from 'path';

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | Array<JSONValue>
  | { [key: string]: JSONValue | undefined };

export interface TSConfig {
  path: string;
  tsconfigJson: { [key: string]: JSONValue | undefined };
}

export interface WorkspaceConfigInfo {
  definition: Package;
  tsconfig: TSConfig | null;
}

export const getWorkspaceInfo = async (
  pkg: Package
): Promise<WorkspaceConfigInfo> => {
  const tsconfigPath = path.join(pkg.dir, 'tsconfig.json');
  let tsconfigJson = null;

  try {
    tsconfigJson = await readJson(tsconfigPath);
  } catch (e) {
    // Do nothing
  }

  return {
    definition: pkg,
    tsconfig: tsconfigJson
      ? {
          path: tsconfigPath,
          tsconfigJson,
        }
      : null,
  };
};

export const getWorkspacesInfo = async (
  cwd: string,
  { checkExisting }: { checkExisting?: boolean }
): Promise<{
  rootWorkspace: WorkspaceConfigInfo;
  workspaces: WorkspaceConfigInfo[];
}> => {
  const { packages, root } = await getPackages(cwd);

  const rootWorkspace = await getWorkspaceInfo(root);
  let workspaces = await Promise.all(packages.map(getWorkspaceInfo));

  if (checkExisting) {
    workspaces = workspaces.filter(w => w.tsconfig);
  }

  return { rootWorkspace, workspaces };
};
