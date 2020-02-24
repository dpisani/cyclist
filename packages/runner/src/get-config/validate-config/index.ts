export interface ConfigValidationResult {
  isValid: boolean;
  messages: string[];
}

export default (): ConfigValidationResult => {
  return { isValid: true, messages: [] };
};
