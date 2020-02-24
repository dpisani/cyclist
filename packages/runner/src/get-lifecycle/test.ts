import { expect } from 'chai';
import getLifecycle from './index';
import { Config } from '../types';

const mockConfig: Config = {
  lifecycles: {
    'my-cycle': {
      stages: ['stage-1']
    }
  }
};

describe('Get build lifecycle utility', () => {
  it('selects a lifecycle from the given config', () => {
    const lifecycle = getLifecycle('my-cycle', mockConfig);

    expect(lifecycle).to.deep.equal({
      stages: ['stage-1']
    });
  });

  it('returns null when no matching lifecycle could be found', () => {
    const lifecycle = getLifecycle('not-my-cycle', mockConfig);

    expect(lifecycle).to.equal(null);
  });
});
