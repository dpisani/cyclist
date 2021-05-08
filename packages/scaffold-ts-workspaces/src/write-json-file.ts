import detectIndent = require('detect-indent');
import { outputJson, pathExists, readFile } from 'fs-extra';
import { JSONDocument } from './get-workspaces-info';

export const writeJsonFile = async (
  filePath: string,
  jsonContents: JSONDocument
): Promise<void> => {
  // get existing indentation
  let indentation = '  ';
  const hasExistingFile = await pathExists(filePath);
  if (hasExistingFile) {
    const existingContent = await readFile(filePath, 'utf8');
    indentation = detectIndent(existingContent).indent || '  ';
  }

  await outputJson(filePath, jsonContents, { spaces: indentation });
};
