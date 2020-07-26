import * as Ajv from 'ajv';
import * as cyclistSchema from '@cyclist/schema/cyclist-config.schema.json';

export interface ConfigValidationResult {
  isValid: boolean;
  messages: string[];
}

export default (config: unknown): ConfigValidationResult => {
  const ajv = new Ajv();
  const validator = ajv.compile(cyclistSchema);

  const isValid = validator(config) as boolean;

  return {
    isValid,
    messages: validator.errors ? [ajv.errorsText(validator.errors)] : [],
  };
};
