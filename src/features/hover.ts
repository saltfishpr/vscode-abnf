import * as vscode from 'vscode';
import { ABNFParser } from '../parser';
import { getNodeAtPosition } from './utils';

export function registerHoverProvider(parser: ABNFParser): vscode.Disposable {
  return vscode.languages.registerHoverProvider('abnf', {
    provideHover(document, position) {
      const parsed = parser.getDocument(document.uri.toString());
      if (!parsed) {
        return undefined;
      }

      const targetNode = getNodeAtPosition(parsed.tree.rootNode, document.offsetAt(position));
      if (!targetNode) {
        return undefined;
      }

      const ruleName = targetNode.text;
      const def = parsed.definitions.find((d) => d.name === ruleName);
      if (!def) {
        return undefined;
      }

      // Get the full rule definition (the parent 'rule' node)
      const ruleNode = def.node.parent;
      if (!ruleNode) {
        return undefined;
      }

      // Get rule text
      const ruleText = ruleNode.text;

      // Get reference count
      const refCount = parsed.references.get(ruleName)?.length ?? 0;

      // Build hover content
      const hoverText = new vscode.MarkdownString();
      hoverText.appendCodeblock(ruleText, 'abnf');

      if (refCount > 0) {
        hoverText.appendMarkdown(`\n---\n\n**References**: ${refCount}`);
      }

      return new vscode.Hover(hoverText);
    },
  });
}
