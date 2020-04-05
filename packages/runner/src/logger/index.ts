type ConsoleArgs = Parameters<typeof console.log>;

export interface Logger {
  info: typeof console.log;
  error: typeof console.log;
}

const LOG_PREFIX: string = '[Cyclist]';

export default class CyclistLogger implements Logger {
  public info(...args: ConsoleArgs) {
    console.log(LOG_PREFIX, ...args);
  }

  public error(...args: ConsoleArgs) {
    console.error(LOG_PREFIX, ...args);
  }
}
