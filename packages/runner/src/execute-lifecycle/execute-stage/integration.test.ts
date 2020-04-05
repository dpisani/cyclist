import * as findUp from 'find-up';
import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as fs from 'fs-extra';

import executeStage from './index';
import { LifecycleStage } from '../../types';
import { createMockLogger } from '../../logger/util';

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

  const stdio = { stderr: stderr.stream, stdout: stdout.stream };
  const data = { getStderr: stderr.getData, getStdout: stdout.getData };

  return { stdio, data };
};

describe('Lifecycle stage executor integration tests', () => {
  it('runs a package script and pipes data from stdout', async () => {
    const fixturePath = await copyFixtureToTemp('basic-project');

    const stage: LifecycleStage = {
      name: 'stdout',
      tasks: [{ script: 'stdout', outputMode: 'stream' }],
      parallel: false,
      background: false,
    };

    const { stdio, data } = await createMockStdio();

    await executeStage(stage, fixturePath, {
      stdio,
      logger: createMockLogger(),
    });

    const outData = await data.getStdout();
    const errData = await data.getStderr();

    outData.toString().should.equal('success!\n');
    errData.should.be.empty();
  });

  it('runs a package script and pipes data from stderr', async () => {
    const fixturePath = await copyFixtureToTemp('basic-project');

    const stage: LifecycleStage = {
      name: 'stderr',
      tasks: [{ script: 'stderr', outputMode: 'stream' }],
      parallel: false,
      background: false,
    };

    const { stdio, data } = await createMockStdio();

    await executeStage(stage, fixturePath, {
      stdio,
      logger: createMockLogger(),
    });

    const outData = await data.getStdout();
    const errData = await data.getStderr();

    errData.toString().should.equal('error!\n');
    outData.should.be.empty();
  });

  it('rejects when the script fails', async () => {
    const fixturePath = await copyFixtureToTemp('basic-project');

    const stage: LifecycleStage = {
      name: 'error',
      tasks: [{ script: 'error', outputMode: 'stream' }],
      parallel: false,
      background: false,
    };

    const { stdio } = await createMockStdio();

    return executeStage(stage, fixturePath, {
      stdio,
      logger: createMockLogger(),
    }).should.be.rejected();
  });

  it('runs a sequence of package scripts', async () => {
    const fixturePath = await copyFixtureToTemp('basic-project');

    const stage: LifecycleStage = {
      name: 'sequence',
      tasks: [
        { script: 'one', outputMode: 'stream' },
        { script: 'two', outputMode: 'stream' },
        { script: 'three', outputMode: 'stream' },
      ],
      parallel: false,
      background: false,
    };

    const { stdio, data } = await createMockStdio();

    await executeStage(stage, fixturePath, {
      stdio,
      logger: createMockLogger(),
    });

    const outData = await data.getStdout();

    outData.toString().should.equal('one\ntwo\nthree\n');
  });

  it('ignores output from stdio when outputMode is ignore', async () => {
    const fixturePath = await copyFixtureToTemp('basic-project');

    const stage: LifecycleStage = {
      name: 'stdout',
      tasks: [
        { script: 'stdout', outputMode: 'ignore' },
        { script: 'stderr', outputMode: 'ignore' },
      ],
      parallel: false,
      background: false,
    };

    const { stdio, data } = await createMockStdio();

    await executeStage(stage, fixturePath, {
      stdio,
      logger: createMockLogger(),
    });

    const outData = await data.getStdout();
    const errData = await data.getStderr();

    outData.should.be.empty();
    errData.should.be.empty();
  });

  describe('parallel stages', () => {
    it('executes multiple commands simultaneously', async () => {
      const fixturePath = await copyFixtureToTemp('parallel-project');

      const stage: LifecycleStage = {
        name: 'multiple',
        tasks: [
          { script: 'slow', outputMode: 'stream' },
          { script: 'medium', outputMode: 'stream' },
          { script: 'fast', outputMode: 'stream' },
        ],
        parallel: true,
        background: false,
      };

      const { stdio, data } = await createMockStdio();

      await executeStage(stage, fixturePath, {
        stdio,
        logger: createMockLogger(),
      });

      const outData = await data.getStdout();

      outData.toString().should.equal('fast\nmedium\nslow\n');
    });

    it('batches output of parallel commands when outputMode is batch', async () => {
      const fixturePath = await copyFixtureToTemp('parallel-project');

      const stage: LifecycleStage = {
        name: 'multiple',
        tasks: [
          { script: 'fast-beeps', outputMode: 'batch' },
          { script: 'slow-boops', outputMode: 'batch' },
        ],
        parallel: true,
        background: false,
      };

      const { stdio, data } = await createMockStdio();

      await executeStage(stage, fixturePath, {
        stdio,
        logger: createMockLogger(),
      });

      const outData = await data.getStdout();

      outData.toString().should.equal('beep\nbeep\nboop\nboop\n');
    });

    it('interleaves output of parallel commands when outputMode is stream', async () => {
      const fixturePath = await copyFixtureToTemp('parallel-project');

      const stage: LifecycleStage = {
        name: 'multiple',
        tasks: [
          { script: 'fast-beeps', outputMode: 'stream' },
          { script: 'slow-boops', outputMode: 'stream' },
        ],
        parallel: true,
        background: false,
      };

      const { stdio, data } = await createMockStdio();

      await executeStage(stage, fixturePath, {
        stdio,
        logger: createMockLogger(),
      });

      const outData = await data.getStdout();

      outData.toString().should.equal('boop\nbeep\nbeep\nboop\n');
    });
  });
});
