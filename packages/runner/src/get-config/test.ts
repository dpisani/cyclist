import { expect, assert } from 'chai';
import * as sinon from 'sinon';
import getConfig from './main';
import { CyclistConfiguration } from '@cyclist/schema';

const configSearchMock = sinon.stub();
const cosmiconfigMock = sinon.stub().returns({ search: configSearchMock });

const mockConfig: CyclistConfiguration = {
  lifecycles: {
    default: {
      stages: ['stage1', 'stage2'],
    },
  },
};

const validateConfigMock = sinon
  .stub()
  .returns({ isValid: true, messages: [] });

describe('Get lifecycle config utility', () => {
  beforeEach(() => {
    sinon.resetHistory();
  });

  it('retrieves the user provided config', async () => {
    configSearchMock.resolves({ config: mockConfig, isEmpty: false });

    const config = await getConfig('/cwd', {
      cosmiconfig: cosmiconfigMock,
      validateConfig: validateConfigMock,
    });

    expect(config).to.deep.equal({
      lifecycles: {
        default: {
          stages: ['stage1', 'stage2'],
        },
      },
    });
  });

  it('rejects when loading the config fails', async () => {
    configSearchMock.rejects('Something happened');

    try {
      await getConfig('/cwd', {
        cosmiconfig: cosmiconfigMock,
        validateConfig: validateConfigMock,
      });
    } catch (e) {
      expect(e).to.match(/Something happened/);
      return;
    }

    assert.fail('Error not caught');
  });

  it('validates the config before returning it', async () => {
    configSearchMock.resolves({ config: mockConfig, isEmpty: false });

    await getConfig('/cwd', {
      cosmiconfig: cosmiconfigMock,
      validateConfig: validateConfigMock,
    });

    expect(validateConfigMock.calledOnceWith(mockConfig)).is.true;
  });

  it('rejects when the provided config is invalid', async () => {
    const failedValidateConfigMock = () => ({
      isValid: false,
      messages: ['You did it wrong.'],
    });
    configSearchMock.resolves({ config: mockConfig, isEmpty: false });

    try {
      await getConfig('/cwd', {
        cosmiconfig: cosmiconfigMock,
        validateConfig: failedValidateConfigMock,
      });
    } catch (e) {
      expect(e).to.be.an('Error');
      expect(e.message).to.match(/You did it wrong/);

      return;
    }

    assert.fail('Error not caught');
  });
});
