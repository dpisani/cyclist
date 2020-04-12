import getLifecycle from './index';
import { Config } from '../types';

const mockConfig: Config = {
  lifecycles: {
    'my-cycle': {
      stages: ['stage-1', 'stage-2'],
    },
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
    const configExpandedStage: Config = {
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
    const configExpandedStage: Config = {
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
    const configExpandedStage: Config = {
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
    const configExpandedStage: Config = {
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

  it('defaults outputMode for tasks to batch when parallel=true', () => {
    const configExpandedStage: Config = {
      lifecycles: {
        'my-cycle': {
          stages: [{ name: 'stage-1', parallel: true }],
        },
      },
    };

    const lifecycle = getLifecycle('my-cycle', configExpandedStage);

    lifecycle!.stages[0].tasks.should.deepEqual([
      { script: 'stage-1', outputMode: 'batch' },
    ]);
  });
});
