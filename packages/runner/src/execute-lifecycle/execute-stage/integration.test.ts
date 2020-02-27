import { Writable } from 'stream';

import * as findUp from 'find-up';
import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as fs from 'fs-extra';

import executeStage from './index';
import { LifecycleStage } from '../../types';

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

// Creates a temporary file to stream to, and a way to extract the data written to it
const createObservableStream = async () => {
  const tmpFile = await tmp.file();

  const stream = fs.createWriteStream(tmpFile.path);

  const getData = () => fs.readFile(tmpFile.path);

  return { stream, getData };
};

const createMockStdio = async () => {
  const stdout = await createObservableStream();
  const stderr = await createObservableStream();

  return { stdout, stderr };
};

describe('Lifecycle stage executor integration tests', () => {
  it('runs a package script and pipes data from stdout', async () => {
    const fixturePath = await copyFixtureToTemp('basic-project');

    const stage: LifecycleStage = {
      name: 'stdout',
      tasks: ['stdout'],
      parallel: false,
      background: false,
    };

    const { stderr, stdout } = await createMockStdio();

    await executeStage(stage, fixturePath, {
      stderr: stderr.stream,
      stdout: stdout.stream,
    });

    const outData = await stdout.getData();
    const errData = await stderr.getData();

    outData.toString().should.equal('success!\n');
    errData.should.be.empty;
  });

  it('runs a package script and pipes data from stderr', async () => {
    const fixturePath = await copyFixtureToTemp('basic-project');

    const stage: LifecycleStage = {
      name: 'stderr',
      tasks: ['stderr'],
      parallel: false,
      background: false,
    };

    const { stderr, stdout } = await createMockStdio();

    await executeStage(stage, fixturePath, {
      stderr: stderr.stream,
      stdout: stdout.stream,
    });

    const outData = await stdout.getData();
    const errData = await stderr.getData();

    errData.toString().should.equal('error!\n');
    outData.should.be.empty;
  });

  it('rejects when the script fails', async () => {
    const fixturePath = await copyFixtureToTemp('basic-project');

    const stage: LifecycleStage = {
      name: 'error',
      tasks: ['error'],
      parallel: false,
      background: false,
    };

    const { stderr, stdout } = await createMockStdio();

    return executeStage(stage, fixturePath, {
      stderr: stderr.stream,
      stdout: stdout.stream,
    }).should.be.rejected();
  });

  it('runs a sequence of package scripts', async () => {
    const fixturePath = await copyFixtureToTemp('basic-project');

    const stage: LifecycleStage = {
      name: 'sequence',
      tasks: ['one', 'two', 'three'],
      parallel: false,
      background: false,
    };

    const { stderr, stdout } = await createMockStdio();

    await executeStage(stage, fixturePath, {
      stderr: stderr.stream,
      stdout: stdout.stream,
    });

    const outData = await stdout.getData();

    outData.toString().should.equal('one\ntwo\nthree\n');
  });

  describe('parallel stages', () => {
    it('executes multiple commands simultaneously', async () => {
      const fixturePath = await copyFixtureToTemp('parallel-project');

      const stage: LifecycleStage = {
        name: 'multiple',
        tasks: ['slow', 'medium', 'fast'],
        parallel: true,
        background: false,
      };

      const { stderr, stdout } = await createMockStdio();

      await executeStage(stage, fixturePath, {
        stderr: stderr.stream,
        stdout: stdout.stream,
      });

      const outData = await stdout.getData();

      outData.toString().should.equal('fast\nmedium\nslow\n');
    });

    it('batches output of parallel commands together', async () => {
      const fixturePath = await copyFixtureToTemp('parallel-project');

      const stage: LifecycleStage = {
        name: 'multiple',
        tasks: ['fast-beeps', 'slow-boops'],
        parallel: true,
        background: false,
      };

      const { stderr, stdout } = await createMockStdio();

      await executeStage(stage, fixturePath, {
        stderr: stderr.stream,
        stdout: stdout.stream,
      });

      const outData = await stdout.getData();

      outData.toString().should.equal('beep\nbeep\nboop\nboop\n');
    });
  });
});
