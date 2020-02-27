import { stub, resetHistory } from 'sinon';

import { executeLifecycle } from './index';
import { Lifecycle } from '../types';

const mockLifecycle: Lifecycle = {
  stages: [
    { name: 'one', tasks: ['one'], parallel: false, background: false },
    { name: 'two', tasks: ['two'], parallel: false, background: false },
    { name: 'three', tasks: ['three'], parallel: false, background: false },
  ],
};

const mockExecuteStage = stub().resolves();

const deps = {
  executeStage: mockExecuteStage,
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
      { name: 'one', tasks: ['one'] },
      '/mock/cwd',
    ]);
    mockExecuteStage.secondCall.args.should.containDeepOrdered([
      { name: 'two', tasks: ['two'] },
      '/mock/cwd',
    ]);
    mockExecuteStage.thirdCall.args.should.containDeepOrdered([
      { name: 'three', tasks: ['three'] },
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

  describe('background stages', () => {
    const backgroundLifecycle: Lifecycle = {
      stages: [
        { name: 'one', tasks: ['one'], parallel: false, background: true },
        { name: 'two', tasks: ['two'], parallel: false, background: false },
      ],
    };

    it('does not wait for a background stage to finish before moving on', async () => {
      // First task hangs indefinitely
      const mockExecuteStageLongTask = stub()
        .onFirstCall()
        .returns(new Promise(() => {}))
        .onSecondCall()
        .resolves();

      await executeLifecycle(
        { lifecycle: backgroundLifecycle, cwd: '/mock/cwd' },
        { executeStage: mockExecuteStageLongTask }
      );

      mockExecuteStageLongTask.firstCall.args.should.containDeepOrdered([
        { name: 'one', tasks: ['one'] },
      ]);
      mockExecuteStageLongTask.secondCall.args.should.containDeepOrdered([
        { name: 'two', tasks: ['two'] },
      ]);
    });

    it('ignores stdio output from background tasks', async () => {
      await executeLifecycle(
        { lifecycle: backgroundLifecycle, cwd: '/mock/cwd' },
        { executeStage: mockExecuteStage }
      );

      mockExecuteStage.firstCall.args[2].should.deepEqual({
        stdout: 'ignore',
        stderr: 'ignore',
      });
    });

    it('treats a background task like a normal one if it is last in the order', async () => {
      let finishFirstTask;
      let isLifecyclePending = true;

      const mockExecuteStageLongTask = stub()
        .onFirstCall()
        .returns(
          new Promise(resolve => {
            finishFirstTask = resolve;
          })
        );

      const lifecycle = executeLifecycle(
        {
          lifecycle: backgroundLifecycle,
          cwd: '/mock/cwd',
          lastStageName: 'one',
        },
        { executeStage: mockExecuteStageLongTask }
      ).then(() => {
        isLifecyclePending = false;
      });

      mockExecuteStageLongTask.firstCall.args[2].should.not.deepEqual({
        stdout: 'ignore',
        stderr: 'ignore',
      });

      // Check that the cycle hasn't moved on
      isLifecyclePending.should.be.true();

      finishFirstTask();
      await lifecycle;

      isLifecyclePending.should.be.false();
    });
  });
});
