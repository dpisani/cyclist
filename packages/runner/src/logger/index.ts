import * as chalk from 'chalk';
type ConsoleArgs = Parameters<typeof console.log>;

export interface Logger {
  info: typeof console.log;
  error: typeof console.log;
}

const LOG_PREFIX = '[Cyclist]';

export default class CyclistLogger implements Logger {
  public info(...args: ConsoleArgs) {
    console.log(chalk.dim(LOG_PREFIX), ...args);
  }

  public error(...args: ConsoleArgs) {
    console.error(chalk.red(LOG_PREFIX), ...args);
  }
}
