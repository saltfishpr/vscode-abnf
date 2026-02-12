import * as vscode from 'vscode';
import { ABNFParser } from '../parser';
import { getNodeAtPosition, toLocation } from './utils';

export function registerReferenceProvider(parser: ABNFParser): vscode.Disposable {
  return vscode.languages.registerReferenceProvider('abnf', {
    provideReferences(document, position, _context) {
      const parsed = parser.getDocument(document.uri.toString());
      if (!parsed) {
        return [];
      }

      const targetNode = getNodeAtPosition(parsed.tree.rootNode, document.offsetAt(position));
      if (!targetNode) {
        return [];
      }

      const results: vscode.Location[] = [];
      const def = parsed.definitions.find((d) => d.name === targetNode.text);
      if (def) {
        results.push(toLocation(def.uri, def.node)!);
      }

      const refNodes = parsed.references.get(targetNode.text);
      if (refNodes) {
        for (const refNode of refNodes) {
          results.push(toLocation(parsed.uri, refNode)!);
        }
      }

      return results;
    },
  });
}
