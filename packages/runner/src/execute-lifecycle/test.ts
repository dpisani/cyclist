import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as fs from 'fs-extra';
import * as findUp from 'find-up';
import { stub } from 'sinon';

import { executeLifecycle } from './index';
import { Lifecycle } from '../types';

const mockLifecycle: Lifecycle = {
  stages: [
    { name: 'one', tasks: ['one'], parallel: false },
    { name: 'two', tasks: ['two'], parallel: false },
    { name: 'three', tasks: ['three'], parallel: false }
  ]
};

const mockExecuteStage = stub();

const deps = {
  executeStage: mockExecuteStage
};

describe('Lifecycle script executor', () => {
  beforeEach(() => {
    mockExecuteStage.reset();
  });

  it('runs all the stages in order', async () => {
    await executeLifecycle(
      { lifecycle: mockLifecycle, cwd: '/mock/cwd' },
      deps
    );

    mockExecuteStage.firstCall.args.should.containDeepOrdered([
      { name: 'one', tasks: ['one'] },
      '/mock/cwd'
    ]);
    mockExecuteStage.secondCall.args.should.containDeepOrdered([
      { name: 'two', tasks: ['two'] },
      '/mock/cwd'
    ]);
    mockExecuteStage.thirdCall.args.should.containDeepOrdered([
      { name: 'three', tasks: ['three'] },
      '/mock/cwd'
    ]);
  });

  it('stops at the given stage', async () => {
    await executeLifecycle(
      {
        lifecycle: mockLifecycle,
        cwd: '/mock/cwd',
        lastStageName: 'two'
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
        lastStageName: 'whoops'
      },
      deps
    ).should.be.rejectedWith(Error('whoops: lifecycle stage not found'));

    mockExecuteStage.called.should.be.false();
  });
});
