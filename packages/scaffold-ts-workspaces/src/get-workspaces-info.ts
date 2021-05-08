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

export type JSONDocument = { [key: string]: JSONValue | undefined };

export interface TSConfig {
  path: string;
  tsconfigJson: JSONDocument;
}

export interface WorkspaceConfigInfo {
  definition: Package;
  tsconfig: TSConfig | null;
  jsonFiles: Map<string, JSONDocument | null>;
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
    jsonFiles: new Map([
      [pkg.dir, pkg.packageJson],
      [tsconfigPath, tsconfigJson],
    ]),
  };
};

export const getWorkspacesInfo = async (
  cwd: string,
  { checkExisting }: { checkExisting?: boolean }
): Promise<{
  rootWorkspace: WorkspaceConfigInfo;
  workspaces: WorkspaceConfigInfo[];
  allJsonConfigFiles: Map<string, JSONDocument | null>;
}> => {
  const { packages, root } = await getPackages(cwd);

  const rootWorkspace = await getWorkspaceInfo(root);
  let workspaces = await Promise.all(packages.map(getWorkspaceInfo));

  if (checkExisting) {
    workspaces = workspaces.filter(w => w.tsconfig);
  }

  return {
    rootWorkspace,
    workspaces,
    allJsonConfigFiles: new Map([
      ...rootWorkspace.jsonFiles,
      ...workspaces.flatMap(w => [...w.jsonFiles]),
    ]),
  };
};
