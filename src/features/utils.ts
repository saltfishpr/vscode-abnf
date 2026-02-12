import * as vscode from 'vscode';
import { Node } from 'web-tree-sitter';

/**
 * Get the syntax tree node at a given position.
 */
export function getNodeAtPosition(rootNode: Node, offset: number): Node | null {
  const node = rootNode.descendantForIndex(offset);
  if (!node) {
    return null;
  }

  if (node.type === 'rulename' || node.type === 'core_rulename') {
    return node;
  }
  if (node.parent && (node.parent.type === 'rulename' || node.parent.type === 'core_rulename')) {
    return node.parent;
  }

  return null;
}

/**
 * Convert a tree-sitter node to a VS Code location.
 */
export function toLocation(uri: string, node: Node): vscode.Location {
  return new vscode.Location(vscode.Uri.parse(uri), toRange(node));
}

/**
 * Convert a tree-sitter node to a VS Code range.
 */
export function toRange(node: Node): vscode.Range {
  return new vscode.Range(
    new vscode.Position(node.startPosition.row, node.startPosition.column),
    new vscode.Position(node.endPosition.row, node.endPosition.column),
  );
}
