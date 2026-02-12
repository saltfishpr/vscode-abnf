import * as vscode from 'vscode';
import { ABNFParser } from '../parser';

export function registerDefinitionProvider(parser: ABNFParser): vscode.Disposable {
  return vscode.languages.registerDefinitionProvider('abnf', {
    provideDefinition(document, position) {
      const parsed = parser.getDocument(document.uri.toString());
      if (!parsed) {
        return undefined;
      }

      const targetNode = parser.getTargetNode(parsed.tree, document.offsetAt(position));
      if (!targetNode) {
        return undefined;
      }

      const def = parsed.definitions.find((d) => d.name === targetNode.text);
      if (def) {
        return parser.getNodeLocation(def.uri, def.node);
      }

      return undefined;
    },
  });
}
