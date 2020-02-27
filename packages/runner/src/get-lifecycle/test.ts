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
          tasks: ['stage-1'],
          parallel: false,
          background: false,
        },
        {
          name: 'stage-2',
          tasks: ['stage-2'],
          parallel: false,
          background: false,
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
          tasks: ['stage-1'],
          parallel: false,
          background: false,
        },
      ],
    });
  });

  it('accepts an array of tasks', () => {
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
          tasks: ['task-1', 'task-2'],
          parallel: false,
          background: false,
        },
      ],
    });
  });

  it('accepts boolean options', () => {
    const configExpandedStage: Config = {
      lifecycles: {
        'my-cycle': {
          stages: [{ name: 'stage-1', parallel: true, background: true }],
        },
      },
    };

    const lifecycle = getLifecycle('my-cycle', configExpandedStage);

    lifecycle!.should.deepEqual({
      stages: [
        {
          name: 'stage-1',
          tasks: ['stage-1'],
          parallel: true,
          background: true,
        },
      ],
    });
  });
});
