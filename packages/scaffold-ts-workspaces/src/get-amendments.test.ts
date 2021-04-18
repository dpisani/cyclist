import 'should';
import { getAmendments } from './get-amendments';

describe('TS workspaces getAmendments utility', () => {
  it('returns nothing when there are no child workspaces', () => {
    getAmendments({
      rootPackage: {
        definition: {
          dir: 'root-dir',
          packageJson: { name: 'root', version: '1.0.0' },
        },
        tsconfig: {},
      },
      packages: [],
    }).should.be.empty();
  });

  describe('root workspace config', () => {
    it('returns nothing when all packages are referenced by the root config', () => {
      getAmendments({
        rootPackage: {
          definition: {
            dir: 'root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            references: [
              {
                path: 'packages/package1',
              },
            ],
          },
        },
        packages: [
          {
            definition: {
              dir: 'root-dir/packages/package1',
              packageJson: { name: 'package1', version: '1.0.0' },
            },
            tsconfig: {
              compilerOptions: { composite: true },
            },
          },
        ],
      }).should.be.empty();
    });

    it('returns an amendment for root references when a package is missing from the list', () => {
      getAmendments({
        rootPackage: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            references: [
              {
                path: './packages/package1',
              },
            ],
          },
        },
        packages: [
          {
            definition: {
              dir: '/root-dir/packages/package1',
              packageJson: { name: 'package1', version: '1.0.0' },
            },
            tsconfig: { compilerOptions: { composite: true } },
          },
          {
            definition: {
              dir: '/root-dir/packages/package2',
              packageJson: { name: 'package2', version: '1.0.0' },
            },
            tsconfig: { compilerOptions: { composite: true } },
          },
        ],
      }).should.deepEqual([
        {
          filePath: '/root-dir/tsconfig.json',
          jsonPath: ['references'],
          desiredValue: [
            {
              path: 'packages/package1',
            },
            {
              path: 'packages/package2',
            },
          ],
          description:
            'Your root tsconfig should list references to all your workspaces.',
        },
      ]);
    });

    it('returns an amendment for root references when there are extraneous references', () => {
      getAmendments({
        rootPackage: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            references: [
              {
                path: './packages/package1',
              },
            ],
          },
        },
        packages: [],
      }).should.deepEqual([
        {
          filePath: '/root-dir/tsconfig.json',
          jsonPath: ['references'],
          desiredValue: [],
          description:
            'Your root tsconfig should list references to all your workspaces.',
        },
      ]);
    });
  });

  describe('child workspaces config', () => {
    it('returns an amendment when a child tsconfig does not have composite set to true', () => {
      getAmendments({
        rootPackage: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            references: [
              {
                path: 'packages/package1',
              },
            ],
          },
        },
        packages: [
          {
            definition: {
              dir: '/root-dir/packages/package1',
              packageJson: { name: 'package1', version: '1.0.0' },
            },
            tsconfig: { compilerOptions: {} },
          },
        ],
      }).should.deepEqual([
        {
          filePath: '/root-dir/packages/package1/tsconfig.json',
          jsonPath: ['compilerOptions', 'composite'],
          desiredValue: true,
          description:
            'Workspace tsconfig files must have the composite setting enabled.',
        },
      ]);
    });

    it('returns amendments to make references between dependant packages', () => {
      getAmendments({
        rootPackage: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            references: [
              {
                path: 'packages/package1',
              },
              {
                path: 'packages/package2',
              },
            ],
          },
        },
        packages: [
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
              compilerOptions: {
                composite: true,
              },
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
            tsconfig: { compilerOptions: { composite: true } },
          },
        ],
      }).should.deepEqual([
        {
          filePath: '/root-dir/packages/package1/tsconfig.json',
          jsonPath: ['references'],
          desiredValue: [
            {
              path: '../package2',
            },
          ],
          description:
            'Your workspace tsconfig should list references to all the other workspaces it depends on.',
        },
      ]);
    });

    it('returns amendments to make references between dev-dependant packages', () => {
      getAmendments({
        rootPackage: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            references: [
              {
                path: 'packages/package1',
              },
              {
                path: 'packages/package2',
              },
            ],
          },
        },
        packages: [
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
              compilerOptions: {
                composite: true,
              },
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
            tsconfig: { compilerOptions: { composite: true } },
          },
        ],
      }).should.deepEqual([
        {
          filePath: '/root-dir/packages/package1/tsconfig.json',
          jsonPath: ['references'],
          desiredValue: [
            {
              path: '../package2',
            },
          ],
          description:
            'Your workspace tsconfig should list references to all the other workspaces it depends on.',
        },
      ]);
    });

    it('returns amendments to make references between peer-dependant packages', () => {
      getAmendments({
        rootPackage: {
          definition: {
            dir: '/root-dir',
            packageJson: { name: 'root', version: '1.0.0' },
          },
          tsconfig: {
            references: [
              {
                path: 'packages/package1',
              },
              {
                path: 'packages/package2',
              },
            ],
          },
        },
        packages: [
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
              compilerOptions: {
                composite: true,
              },
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
            tsconfig: { compilerOptions: { composite: true } },
          },
        ],
      }).should.deepEqual([
        {
          filePath: '/root-dir/packages/package1/tsconfig.json',
          jsonPath: ['references'],
          desiredValue: [
            {
              path: '../package2',
            },
          ],
          description:
            'Your workspace tsconfig should list references to all the other workspaces it depends on.',
        },
      ]);
    });
  });
});
