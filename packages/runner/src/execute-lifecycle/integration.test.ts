import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as fs from 'fs-extra';
import * as findUp from 'find-up';
import { expect, assert } from 'chai';

import executeLifecycle from './index';

const copyFixtureToTemp = async (fixtureName: string): Promise<string> => {
  const fixturesDir = await findUp('test-fixtures', { type: 'directory' });
  if (!fixturesDir) {
    throw new Error('test-fixtures directory could not be found');
  }
  const fixtureDir = path.join(fixturesDir, fixtureName);

  const tmpDir = await tmp.dir();

  await fs.copy(fixtureDir, tmpDir.path);

  return tmpDir.path;
};

describe('Lifecycle script executor', () => {
  it('runs all the stages using the package scripts', async () => {
    const lifecycle = { stages: ['one', 'two', 'three'] };

    const fixturePath = await copyFixtureToTemp('basic-project');

    await executeLifecycle({ lifecycle, cwd: fixturePath });

    // output of lifecycle is in command-log.txt
    const output = await fs.readFile(
      path.join(fixturePath, 'command-log.txt'),
      { encoding: 'utf-8' }
    );
    expect(output.trim().split('\n')).to.deep.equal(['one', 'two', 'three']);
  });

  it('stops at the given stage', async () => {
    const lifecycle = { stages: ['one', 'two', 'three'] };

    const fixturePath = await copyFixtureToTemp('basic-project');

    await executeLifecycle({ lifecycle, cwd: fixturePath, stageName: 'two' });

    // output of lifecycle is in command-log.txt
    const output = await fs.readFile(
      path.join(fixturePath, 'command-log.txt'),
      { encoding: 'utf-8' }
    );
    expect(output.trim().split('\n')).to.deep.equal(['one', 'two']);
  });

  it('rejects if the given stage is not in the lifecycle', async () => {
    const lifecycle = { stages: ['one', 'two', 'three'] };

    const fixturePath = await copyFixtureToTemp('basic-project');

    await assert.isRejected(
      executeLifecycle({
        lifecycle,
        cwd: fixturePath,
        stageName: 'whoops'
      }),
      Error,
      'whoops: lifecycle stage not found'
    );
  });
});
