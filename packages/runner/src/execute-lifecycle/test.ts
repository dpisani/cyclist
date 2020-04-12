import { stub, resetHistory } from 'sinon';

import { executeLifecycle } from './index';
import { Lifecycle } from '../types';
import { createMockLogger } from '../logger/util';

const mockLifecycle: Lifecycle = {
  stages: [
    {
      name: 'one',
      tasks: [{ script: 'one', outputMode: 'stream' }],
      parallel: false,
    },
    {
      name: 'two',
      tasks: [{ script: 'two', outputMode: 'stream' }],
      parallel: false,
    },
    {
      name: 'three',
      tasks: [{ script: 'three', outputMode: 'stream' }],
      parallel: false,
    },
  ],
};

const mockExecuteStage = stub().resolves();

const deps = {
  executeStage: mockExecuteStage,
  logger: createMockLogger(),
};

describe('Lifecycle execution orchestrator', () => {
  beforeEach(() => {
    resetHistory();
  });

  it('runs all the stages in order', async () => {
    await executeLifecycle(
      { lifecycle: mockLifecycle, cwd: '/mock/cwd' },
      deps
    );

    mockExecuteStage.firstCall.args.should.containDeepOrdered([
      { name: 'one', tasks: [{ script: 'one', outputMode: 'stream' }] },
      '/mock/cwd',
    ]);
    mockExecuteStage.secondCall.args.should.containDeepOrdered([
      { name: 'two', tasks: [{ script: 'two', outputMode: 'stream' }] },
      '/mock/cwd',
    ]);
    mockExecuteStage.thirdCall.args.should.containDeepOrdered([
      { name: 'three', tasks: [{ script: 'three', outputMode: 'stream' }] },
      '/mock/cwd',
    ]);
  });

  it('stops at the given stage', async () => {
    await executeLifecycle(
      {
        lifecycle: mockLifecycle,
        cwd: '/mock/cwd',
        lastStageName: 'two',
      },
      deps
    );

    mockExecuteStage.firstCall.args[0].should.deepEqual(
      mockLifecycle.stages[0]
    );
    mockExecuteStage.secondCall.args[0].should.deepEqual(
      mockLifecycle.stages[1]
    );
  });

  it('rejects if the given stage is not in the lifecycle', async () => {
    await executeLifecycle(
      {
        lifecycle: mockLifecycle,
        cwd: '/mock/cwd',
        lastStageName: 'whoops',
      },
      deps
    ).should.be.rejectedWith(Error('whoops: lifecycle stage not found'));

    mockExecuteStage.called.should.be.false();
  });
});
