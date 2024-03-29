import 'should';
import { getAmendments } from './get-amendments';

describe('TS workspaces getAmendments utility', () => {
  it('returns nothing when there are no child workspaces', () => {
    getAmendments({
      rootWorkspace: {
        definition: {
          dir: '/root-dir',
          packageJson: { name: 'root', version: '1.0.0' },
        },
        tsconfig: { tsconfigJson: {}, path: 'root-dir/tsconfig.json' },
      },
      workspaces: [],
    }).should.be.empty();
  });

  describe('root workspace config', () => {
    it('returns nothing when all packages are referenced by the root config', () => {
      getAmendments({
        rootWorkspace: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            tsconfigJson: {
              references: [
                {
                  path: 'packages/package1',
                },
              ],
            },
            path: '/root-dir/tsconfig.json',
          },
        },
        workspaces: [
          {
            definition: {
              dir: '/root-dir/packages/package1',
              packageJson: { name: 'package1', version: '1.0.0' },
            },
            tsconfig: {
              tsconfigJson: {
                compilerOptions: { composite: true },
              },
              path: '/root-dir/packages/package1/tsconfig.json',
            },
          },
        ],
      }).should.be.empty();
    });

    it('returns an amendment for root references when a package is missing from the list', () => {
      getAmendments({
        rootWorkspace: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            tsconfigJson: {
              references: [
                {
                  path: './packages/package1',
                },
              ],
            },
            path: '/root-dir/tsconfig.json',
          },
        },
        workspaces: [
          {
            definition: {
              dir: '/root-dir/packages/package1',
              packageJson: { name: 'package1', version: '1.0.0' },
            },
            tsconfig: {
              tsconfigJson: { compilerOptions: { composite: true } },
              path: '/root-dir/packages/package1/tsconfig.json',
            },
          },
          {
            definition: {
              dir: '/root-dir/packages/package2',
              packageJson: { name: 'package2', version: '1.0.0' },
            },
            tsconfig: {
              tsconfigJson: { compilerOptions: { composite: true } },
              path: '/root-dir/packages/package2/tsconfig.json',
            },
          },
        ],
      }).should.deepEqual([
        {
          filePath: '/root-dir/tsconfig.json',
          patch: {
            path: '/references',
            op: 'replace',
            value: [
              {
                path: 'packages/package1',
              },
              {
                path: 'packages/package2',
              },
            ],
          },
          description:
            'Your root tsconfig should list references to all your workspaces.',
        },
      ]);
    });

    it('returns an amendment for root references when there are extraneous references', () => {
      getAmendments({
        rootWorkspace: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            tsconfigJson: {
              references: [
                {
                  path: './packages/package1',
                },
              ],
            },
            path: '/root-dir/tsconfig.json',
          },
        },
        workspaces: [],
      }).should.deepEqual([
        {
          filePath: '/root-dir/tsconfig.json',
          patch: {
            path: '/references',
            op: 'replace',
            value: [],
          },
          description:
            'Your root tsconfig should list references to all your workspaces.',
        },
      ]);
    });
  });

  it('returns an amendment when the root tsconfig.json is missing', () => {
    getAmendments({
      rootWorkspace: {
        definition: {
          dir: '/root-dir',
          packageJson: { name: 'root', version: '1.0.0' },
        },
        tsconfig: null,
      },
      workspaces: [
        {
          definition: {
            dir: '/root-dir/packages/package1',
            packageJson: { name: 'package1', version: '1.0.0' },
          },
          tsconfig: {
            tsconfigJson: {
              compilerOptions: { composite: true },
            },
            path: '/root-dir/packages/package1/tsconfig.json',
          },
        },
      ],
    }).should.deepEqual([
      {
        filePath: '/root-dir/tsconfig.json',
        patch: {
          path: '/',
          op: 'add',
          value: {
            references: [{ path: 'packages/package1' }],
          },
        },
        description:
          'You should have a root tsconfig to build the entire project.',
      },
    ]);
  });

  describe('child workspaces config', () => {
    it('returns an amendment when a child tsconfig does not have composite set to true', () => {
      getAmendments({
        rootWorkspace: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            tsconfigJson: {
              references: [
                {
                  path: 'packages/package1',
                },
              ],
            },
            path: '/root-dir/tsconfig.json',
          },
        },
        workspaces: [
          {
            definition: {
              dir: '/root-dir/packages/package1',
              packageJson: { name: 'package1', version: '1.0.0' },
            },
            tsconfig: {
              tsconfigJson: { compilerOptions: {} },
              path: '/root-dir/packages/package1/tsconfig.json',
            },
          },
        ],
      }).should.deepEqual([
        {
          filePath: '/root-dir/packages/package1/tsconfig.json',
          patch: {
            path: '/compilerOptions/composite',
            op: 'add',
            value: true,
          },
          description:
            'Workspace tsconfig files must have the composite setting enabled.',
        },
      ]);
    });

    it('returns amendments to make references between dependant packages', () => {
      getAmendments({
        rootWorkspace: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            tsconfigJson: {
              references: [
                {
                  path: 'packages/package1',
                },
                {
                  path: 'packages/package2',
                },
              ],
            },
            path: '/root-dir/tsconfig.json',
          },
        },
        workspaces: [
          {
            definition: {
              dir: '/root-dir/packages/package1',
              packageJson: {
                name: 'package1',
                version: '1.0.0',
                dependencies: { package2: '1.0.0' },
              },
            },
            tsconfig: {
              tsconfigJson: {
                compilerOptions: {
                  composite: true,
                },
              },
              path: '/root-dir/packages/package1/tsconfig.json',
            },
          },
          {
            definition: {
              dir: '/root-dir/packages/package2',
              packageJson: {
                name: 'package2',
                version: '1.0.0',
              },
            },
            tsconfig: {
              tsconfigJson: {
                compilerOptions: {
                  composite: true,
                },
              },
              path: '/root-dir/packages/package2/tsconfig.json',
            },
          },
        ],
      }).should.deepEqual([
        {
          filePath: '/root-dir/packages/package1/tsconfig.json',
          patch: {
            path: '/references',
            op: 'add',
            value: [
              {
                path: '../package2',
              },
            ],
          },
          description:
            'Your workspace tsconfig should list references to all the other workspaces it depends on.',
        },
      ]);
    });

    it('returns amendments to make references between dev-dependant packages', () => {
      getAmendments({
        rootWorkspace: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            tsconfigJson: {
              references: [
                {
                  path: 'packages/package1',
                },
                {
                  path: 'packages/package2',
                },
              ],
            },
            path: '/root-dir/tsconfig.json',
          },
        },
        workspaces: [
          {
            definition: {
              dir: '/root-dir/packages/package1',
              packageJson: {
                name: 'package1',
                version: '1.0.0',
                devDependencies: { package2: '1.0.0' },
              },
            },
            tsconfig: {
              tsconfigJson: {
                compilerOptions: {
                  composite: true,
                },
              },
              path: '/root-dir/packages/package1/tsconfig.json',
            },
          },
          {
            definition: {
              dir: '/root-dir/packages/package2',
              packageJson: {
                name: 'package2',
                version: '1.0.0',
              },
            },
            tsconfig: {
              tsconfigJson: {
                compilerOptions: {
                  composite: true,
                },
              },
              path: '/root-dir/packages/package2/tsconfig.json',
            },
          },
        ],
      }).should.deepEqual([
        {
          filePath: '/root-dir/packages/package1/tsconfig.json',
          patch: {
            path: '/references',
            op: 'add',
            value: [
              {
                path: '../package2',
              },
            ],
          },
          description:
            'Your workspace tsconfig should list references to all the other workspaces it depends on.',
        },
      ]);
    });

    it('returns amendments to make references between peer-dependant packages', () => {
      getAmendments({
        rootWorkspace: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            tsconfigJson: {
              references: [
                {
                  path: 'packages/package1',
                },
                {
                  path: 'packages/package2',
                },
              ],
            },
            path: '/root-dir/tsconfig.json',
          },
        },
        workspaces: [
          {
            definition: {
              dir: '/root-dir/packages/package1',
              packageJson: {
                name: 'package1',
                version: '1.0.0',
                peerDependencies: { package2: '1.0.0' },
              },
            },
            tsconfig: {
              tsconfigJson: {
                compilerOptions: {
                  composite: true,
                },
              },
              path: '/root-dir/packages/package1/tsconfig.json',
            },
          },
          {
            definition: {
              dir: '/root-dir/packages/package2',
              packageJson: {
                name: 'package2',
                version: '1.0.0',
              },
            },
            tsconfig: {
              tsconfigJson: {
                compilerOptions: {
                  composite: true,
                },
              },
              path: '/root-dir/packages/package2/tsconfig.json',
            },
          },
        ],
      }).should.deepEqual([
        {
          filePath: '/root-dir/packages/package1/tsconfig.json',
          patch: {
            path: '/references',
            op: 'add',
            value: [
              {
                path: '../package2',
              },
            ],
          },
          description:
            'Your workspace tsconfig should list references to all the other workspaces it depends on.',
        },
      ]);
    });
  });
});
