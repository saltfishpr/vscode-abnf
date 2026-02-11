import * as vscode from 'vscode';
import { parseDocument, getNodeAtPosition, nodeToRange, findRuleDefinitionNode } from './parser';

export class AbnfDefinitionProvider implements vscode.DefinitionProvider {
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): Promise<vscode.Location | undefined> {
    const tree = await parseDocument(document);
    if (!tree) {
      return undefined;
    }

    const node = getNodeAtPosition(tree, position);
    if (!node || (node.type !== 'rulename' && node.parent?.type !== 'rulename')) {
      return undefined;
    }

    const ruleNameNode = node.type === 'rulename' ? node : node.parent;
    if (!ruleNameNode) {
      return undefined;
    }

    const ruleName = ruleNameNode.text;

    const targetNode = findRuleDefinitionNode(tree, ruleName);
    if (!targetNode) {
      return undefined;
    }

    const targetRange = nodeToRange(targetNode);
    return new vscode.Location(document.uri, targetRange);
  }
}
