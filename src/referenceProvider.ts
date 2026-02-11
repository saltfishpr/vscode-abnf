import * as vscode from 'vscode';
import {
  parseDocument,
  getNodeAtPosition,
  nodeToRange,
  findAllRulenameReferences,
  findRuleDefinitionNode,
} from './parser';

export class AbnfReferenceProvider implements vscode.ReferenceProvider {
  async provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
    _context: vscode.ReferenceContext,
    _token: vscode.CancellationToken,
  ): Promise<vscode.Location[]> {
    const tree = await parseDocument(document);
    if (!tree) {
      return [];
    }

    const node = getNodeAtPosition(tree, position);
    if (!node || (node.type !== 'rulename' && node.parent?.type !== 'rulename')) {
      return [];
    }

    const ruleNameNode = node.type === 'rulename' ? node : node.parent;
    if (!ruleNameNode) {
      return [];
    }

    const ruleName = ruleNameNode.text;
    const refs = findAllRulenameReferences(tree, ruleName);

    const locations: vscode.Location[] = [];
    for (const ref of refs) {
      const range = nodeToRange(ref);
      locations.push(new vscode.Location(document.uri, range));
    }

    return locations;
  }
}

export class AbnfImplementationProvider implements vscode.ImplementationProvider {
  async provideImplementation(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): Promise<vscode.Definition | undefined> {
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
