import 'should';
import getLifecycle, { getAllLifecycles } from './index';
import { CyclistConfiguration } from '@cyclist/schema';

const mockConfig: CyclistConfiguration = {
  lifecycles: {
    'my-cycle': {
      stages: ['stage-1', 'stage-2'],
    },
    'my-cycle-2': ['stage-1', 'stage-2'],
  },
};

describe('Get build lifecycle utility', () => {
  it('selects a lifecycle from the given config and reformats string stages into a standard shape', () => {
    const lifecycle = getLifecycle('my-cycle', mockConfig);

    lifecycle!.should.deepEqual({
      stages: [
        {
          name: 'stage-1',
          tasks: [{ script: 'stage-1', outputMode: 'stream' }],
          parallel: false,
        },
        {
          name: 'stage-2',
          tasks: [{ script: 'stage-2', outputMode: 'stream' }],
          parallel: false,
        },
      ],
    });
  });

  it('returns null when no matching lifecycle could be found', () => {
    const lifecycle = getLifecycle('not-my-cycle', mockConfig);

    (lifecycle === null).should.be.true();
  });

  it('provides defaults for stage configs', () => {
    const configExpandedStage: CyclistConfiguration = {
      lifecycles: {
        'my-cycle': {
          stages: [{ name: 'stage-1' }],
        },
      },
    };

    const lifecycle = getLifecycle('my-cycle', configExpandedStage);

    lifecycle!.should.deepEqual({
      stages: [
        {
          name: 'stage-1',
          tasks: [{ script: 'stage-1', outputMode: 'stream' }],
          parallel: false,
        },
      ],
    });
  });

  it('accepts an array of tasks as strings and reformats their shape', () => {
    const configExpandedStage: CyclistConfiguration = {
      lifecycles: {
        'my-cycle': {
          stages: [{ name: 'stage-1', tasks: ['task-1', 'task-2'] }],
        },
      },
    };

    const lifecycle = getLifecycle('my-cycle', configExpandedStage);

    lifecycle!.should.deepEqual({
      stages: [
        {
          name: 'stage-1',
          tasks: [
            { script: 'task-1', outputMode: 'stream' },
            { script: 'task-2', outputMode: 'stream' },
          ],
          parallel: false,
        },
      ],
    });
  });

  it('accepts boolean options for stages', () => {
    const configExpandedStage: CyclistConfiguration = {
      lifecycles: {
        'my-cycle': {
          stages: [{ name: 'stage-1', parallel: true }],
        },
      },
    };

    const lifecycle = getLifecycle('my-cycle', configExpandedStage);

    lifecycle!.should.containDeep({
      stages: [
        {
          parallel: true,
        },
      ],
    });
  });

  it('accepts options for tasks', () => {
    const configExpandedStage: CyclistConfiguration = {
      lifecycles: {
        'my-cycle': {
          stages: [
            {
              name: 'stage-1',
              tasks: [
                { script: 'task-1', outputMode: 'batch' },
                { script: 'task-2', outputMode: 'ignore' },
              ],
            },
          ],
        },
      },
    };

    const lifecycle = getLifecycle('my-cycle', configExpandedStage);

    lifecycle!.should.deepEqual({
      stages: [
        {
          name: 'stage-1',
          tasks: [
            { script: 'task-1', outputMode: 'batch' },
            { script: 'task-2', outputMode: 'ignore' },
          ],
          parallel: false,
        },
      ],
    });
  });

  it('uses stage default outputMode for tasks', () => {
    const configExpandedStage: CyclistConfiguration = {
      lifecycles: {
        'my-cycle': {
          stages: [{ name: 'stage-1', parallel: true, outputMode: 'ignore' }],
        },
      },
    };

    const lifecycle = getLifecycle('my-cycle', configExpandedStage);

    lifecycle!.stages[0].tasks.should.deepEqual([
      { script: 'stage-1', outputMode: 'ignore' },
    ]);
  });

  describe('Get all build lifecycles utility', () => {
    it('should get configs for all lifecycles', () => {
      const lifecycles = getAllLifecycles(mockConfig);

      lifecycles.should.have.properties('my-cycle', 'my-cycle-2');
    });
  });
});
