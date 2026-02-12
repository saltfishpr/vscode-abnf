import * as vscode from 'vscode';
import { ABNFParser } from '../parser';
import { getNodeAtPosition, toRange } from './utils';

export function registerRenameProvider(parser: ABNFParser): vscode.Disposable {
  return vscode.languages.registerRenameProvider('abnf', {
    prepareRename(document, position) {
      const parsed = parser.getDocument(document.uri.toString());
      if (!parsed) {
        return undefined;
      }

      const targetNode = getNodeAtPosition(parsed.tree.rootNode, document.offsetAt(position));
      if (!targetNode) {
        return undefined;
      }

      // Only allow renaming rulenames that are defined (not core rules)
      const def = parsed.definitions.find((d) => d.name === targetNode.text);
      if (!def) {
        return undefined;
      }

      return toRange(targetNode);
    },

    provideRenameEdits(document, position, newName) {
      const parsed = parser.getDocument(document.uri.toString());
      if (!parsed) {
        return undefined;
      }

      const targetNode = getNodeAtPosition(parsed.tree.rootNode, document.offsetAt(position));
      if (!targetNode) {
        return undefined;
      }

      const def = parsed.definitions.find((d) => d.name === targetNode.text);
      if (!def) {
        return undefined;
      }

      const edit = new vscode.WorkspaceEdit();

      // Rename the definition
      edit.replace(vscode.Uri.parse(def.uri), toRange(def.node), newName);

      // Rename all references
      const refNodes = parsed.references.get(targetNode.text);
      if (refNodes) {
        for (const refNode of refNodes) {
          edit.replace(vscode.Uri.parse(parsed.uri), toRange(refNode), newName);
        }
      }

      return edit;
    },
  });
}
