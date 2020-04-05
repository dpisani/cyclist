import { stub } from 'sinon';

export const createMockLogger = () => ({
  info: stub(),
  error: stub(),
});
