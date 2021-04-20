import * as findUp from 'find-up';
import { copy, mkdtemp } from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { getWorkspacesInfo, WorkspaceConfigInfo } from './get-workspaces-info';

const copyFixtureToTemp = async (fixtureName: string): Promise<string> => {
  const fixturesDir = await findUp('test-fixtures', { type: 'directory' });
  if (!fixturesDir) {
    throw new Error('test-fixtures directory could not be found');
  }
  const fixtureDir = path.join(fixturesDir, fixtureName);
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'test-'));

  await copy(fixtureDir, tmpDir);

  return tmpDir;
};

describe('Get TS workspaces build info integration test', () => {
  let testWorkspacesDir: string;
  let workspacesInfo: {
    rootWorkspace: WorkspaceConfigInfo;
    workspaces: WorkspaceConfigInfo[];
  };

  before(async () => {
    testWorkspacesDir = await copyFixtureToTemp('ts-workspaces-project');

    workspacesInfo = await getWorkspacesInfo(testWorkspacesDir);
  });

  it('scans info about the workspace root', () => {
    workspacesInfo.rootWorkspace.definition.dir.should.equal(
      `${testWorkspacesDir}`
    );
    workspacesInfo.rootWorkspace.definition.packageJson.name.should.equal(
      'ts-workspaces-project-root'
    );

    workspacesInfo.rootWorkspace.tsconfig?.path.should.equal(
      `${testWorkspacesDir}/tsconfig.json`
    );
    workspacesInfo.rootWorkspace.tsconfig?.tsconfigJson.should.deepEqual({});
  });

  it('scans info about child workspaces', () => {
    // workspace-1
    workspacesInfo.workspaces[0].definition.dir.should.equal(
      `${testWorkspacesDir}/workspace-1`
    );
    workspacesInfo.workspaces[0].definition.packageJson.name.should.equal(
      'ts-workspaces-project-workspace-1'
    );

    workspacesInfo.workspaces[0].tsconfig?.path.should.equal(
      `${testWorkspacesDir}/workspace-1/tsconfig.json`
    );
    workspacesInfo.workspaces[0].tsconfig?.tsconfigJson.should.deepEqual({});

    // workspace-2
    workspacesInfo.workspaces[1].definition.dir.should.equal(
      `${testWorkspacesDir}/workspace-2`
    );
    workspacesInfo.workspaces[1].definition.packageJson.name.should.equal(
      'ts-workspaces-project-workspace-2'
    );

    workspacesInfo.workspaces[1].tsconfig?.path.should.equal(
      `${testWorkspacesDir}/workspace-2/tsconfig.json`
    );
    workspacesInfo.workspaces[1].tsconfig?.tsconfigJson.should.deepEqual({});
  });
});
