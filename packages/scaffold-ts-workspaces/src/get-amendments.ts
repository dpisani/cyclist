import { Operation as JsonPatchOperation } from 'fast-json-patch';
import * as path from 'path';
import { WorkspaceConfigInfo } from './get-workspaces-info';
import { diffArrays } from './diff-arrays';

export interface JsonFileAmendment {
  // Absolute path to the file that should be modified
  filePath: string;
  // The desired change to be made to the file
  patch: JsonPatchOperation;
  // A human readable description of the change that should be made
  description: string;
}

export const getAmendments = ({
  rootWorkspace: rootPackage,
  workspaces: packages,
}: {
  rootWorkspace: Pick<WorkspaceConfigInfo, 'definition' | 'tsconfig'>;
  workspaces: Pick<WorkspaceConfigInfo, 'definition' | 'tsconfig'>[];
}): JsonFileAmendment[] => {
  const amendments: JsonFileAmendment[] = [];
  // Look for root package amendments

  // All child packages should be in the references section of the root tsconfig
  const desiredRootReferences = packages.map(({ definition }) => ({
    path: path.relative(rootPackage.definition.dir, definition.dir),
  }));

  if (rootPackage.tsconfig) {
    const rootReferencesDiff = diffArrays(
      Array.isArray(rootPackage.tsconfig.tsconfigJson.references)
        ? rootPackage.tsconfig.tsconfigJson.references
        : [],
      desiredRootReferences
    );
    const hasIncorrectRootReferences =
      rootReferencesDiff.leftAdditions.length > 0 ||
      rootReferencesDiff.rightAdditions.length > 0;

    if (hasIncorrectRootReferences) {
      amendments.push({
        filePath: rootPackage.tsconfig.path,
        patch: {
          path: '/references',
          op:
            rootPackage.tsconfig.tsconfigJson.references === undefined
              ? 'add'
              : 'replace',
          value: desiredRootReferences,
        },
        description:
          'Your root tsconfig should list references to all your workspaces.',
      });
    }
  } else {
    amendments.push({
      filePath: path.join(rootPackage.definition.dir, 'tsconfig.json'),
      patch: {
        path: '/',
        op: 'add',
        value: {
          references: desiredRootReferences,
        },
      },
      description:
        'You should have a root tsconfig to build the entire project.',
    });
  }

  // Look for child package amendments

  for (const workspace of packages) {
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

    if (workspace.tsconfig) {
      if (
        typeof workspace.tsconfig.tsconfigJson.compilerOptions !== 'object' ||
        Array.isArray(workspace.tsconfig.tsconfigJson.compilerOptions)
      ) {
        amendments.push({
          filePath: workspace.tsconfig.path,
          patch: {
            path: '/compilerOptions',
            op:
              workspace.tsconfig.tsconfigJson.compilerOptions === undefined
                ? 'add'
                : 'replace',
            value: { composite: true },
          },
          description: 'compilerOptions must be an object.',
        });
      } else {
        // All child tsconfigs should have composite mode on

        if (
          workspace.tsconfig.tsconfigJson.compilerOptions?.composite !== true
        ) {
          amendments.push({
            filePath: workspace.tsconfig.path,
            patch: {
              path: '/compilerOptions/composite',
              op:
                workspace.tsconfig.tsconfigJson.compilerOptions?.composite ===
                undefined
                  ? 'add'
                  : 'replace',
              value: true,
            },
            description:
              'Workspace tsconfig files must have the composite setting enabled.',
          });
        }

        const referencesDiff = diffArrays(
          Array.isArray(workspace.tsconfig.tsconfigJson.references)
            ? workspace.tsconfig.tsconfigJson.references
            : [],
          desiredReferences
        );

        const hasIncorrectReferences =
          referencesDiff.leftAdditions.length > 0 ||
          referencesDiff.rightAdditions.length > 0;

        if (hasIncorrectReferences) {
          amendments.push({
            filePath: workspace.tsconfig.path,
            patch: {
              path: '/references',
              op:
                workspace.tsconfig.tsconfigJson.references === undefined
                  ? 'add'
                  : 'replace',
              value: desiredReferences,
            },
            description:
              'Your workspace tsconfig should list references to all the other workspaces it depends on.',
          });
        }
      }
    } else {
      amendments.push({
        filePath: path.join(workspace.definition.dir, 'tsconfig.json'),
        patch: {
          path: '/',
          op: 'add',
          value: {
            references: desiredReferences,
            compilerOptions: {
              composite: true,
            },
          },
        },
        description: 'You should have a tsconfig in each workspace.',
      });
    }
  }

  return amendments;
};
