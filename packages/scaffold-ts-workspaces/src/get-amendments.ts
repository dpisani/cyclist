import { Package } from '@manypkg/get-packages';
import * as path from 'path';
import { diffArrays } from './util/diff-arrays';

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | Array<JSONValue>
  | { [key: string]: JSONValue | undefined };

interface JsonFileAmendment {
  // Absolute path to the file that should be modified
  filePath: string;
  // The object path to the entry within the file that should be changed
  jsonPath: Array<string>;
  // The desired replacement value for the specified path
  desiredValue: JSONValue;
  // A human readable description of the change that should be made
  description: string;
}

interface PackageBuildInfo {
  definition: Package;
  tsconfig: { [key: string]: JSONValue | undefined };
}

export const getAmendments = ({
  rootPackage,
  packages,
}: {
  rootPackage: PackageBuildInfo;
  packages: PackageBuildInfo[];
}): JsonFileAmendment[] => {
  const amendments: JsonFileAmendment[] = [];
  // Look for root package amendments

  // All child packages should be in the references section of the root tsconfig
  const desiredRootReferences = packages.map(({ definition }) => ({
    path: path.relative(rootPackage.definition.dir, definition.dir),
  }));
  const rootReferencesDiff = diffArrays(
    Array.isArray(rootPackage.tsconfig.references)
      ? rootPackage.tsconfig.references
      : [],
    desiredRootReferences
  );
  const hasIncorrectRootReferences =
    rootReferencesDiff.leftAdditions.length > 0 ||
    rootReferencesDiff.rightAdditions.length > 0;

  if (hasIncorrectRootReferences) {
    amendments.push({
      filePath: path.join(rootPackage.definition.dir, 'tsconfig.json'),
      jsonPath: ['references'],
      desiredValue: desiredRootReferences,
      description:
        'Your root tsconfig should list references to all your workspaces.',
    });
  }

  // Look for child package amendments

  for (const workspace of packages) {
    if (
      typeof workspace.tsconfig.compilerOptions !== 'object' ||
      Array.isArray(workspace.tsconfig.compilerOptions)
    ) {
      amendments.push({
        filePath: path.join(workspace.definition.dir, 'tsconfig.json'),
        jsonPath: ['compilerOptions'],
        desiredValue: { composite: true },
        description: 'compilerOptions must be a valid object.',
      });
    } else {
      // All child tsconfigs should have composite mode on

      if (workspace.tsconfig.compilerOptions?.composite !== true) {
        amendments.push({
          filePath: path.join(workspace.definition.dir, 'tsconfig.json'),
          jsonPath: ['compilerOptions', 'composite'],
          desiredValue: true,
          description:
            'Workspace tsconfig files must have the composite setting enabled.',
        });
      }

      // Each workspace tsconfig should have references for other workspaces it depends on

      const dependingWorkspaces = packages.filter(
        pkg =>
          workspace.definition.packageJson.dependencies?.hasOwnProperty(
            pkg.definition.packageJson.name
          ) ||
          workspace.definition.packageJson.devDependencies?.hasOwnProperty(
            pkg.definition.packageJson.name
          ) ||
          workspace.definition.packageJson.peerDependencies?.hasOwnProperty(
            pkg.definition.packageJson.name
          )
      );

      const desiredReferences = dependingWorkspaces.map(w => ({
        path: path.relative(workspace.definition.dir, w.definition.dir),
      }));

      const referencesDiff = diffArrays(
        Array.isArray(workspace.tsconfig.references)
          ? workspace.tsconfig.references
          : [],
        desiredReferences
      );

      const hasIncorrectReferences =
        referencesDiff.leftAdditions.length > 0 ||
        referencesDiff.rightAdditions.length > 0;

      if (hasIncorrectReferences) {
        amendments.push({
          filePath: path.join(workspace.definition.dir, 'tsconfig.json'),
          jsonPath: ['references'],
          desiredValue: desiredReferences,
          description:
            'Your workspace tsconfig should list references to all the other workspaces it depends on.',
        });
      }
    }
  }

  return amendments;
};
