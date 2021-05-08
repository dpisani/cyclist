import { applyPatch, deepClone } from 'fast-json-patch';
import { JsonFileAmendment } from './get-amendments';
import { JSONDocument } from './get-workspaces-info';

export const applyAmendments = (
  jsonFileContents: Map<string, JSONDocument | null>,
  jsonFileAmendments: JsonFileAmendment[]
): Map<string, JSONDocument> => {
  const resultFiles = new Map<string, JSONDocument>();

  jsonFileContents.forEach((originalContent, filePath) => {
    const patches = jsonFileAmendments
      .filter(amendment => amendment.filePath === filePath)
      .map(amendment => amendment.patch);

    if (patches.length > 0) {
      const resultJson = applyPatch(
        originalContent ?? {},
        deepClone(patches),
        true,
        false
      ).newDocument;

      resultFiles.set(filePath, resultJson);
    }
  });

  return resultFiles;
};
