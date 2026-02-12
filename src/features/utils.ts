import * as vscode from 'vscode';
import { Node } from 'web-tree-sitter';

/**
 * Get the syntax tree node at a given position.
 */
export function getNodeAtPosition(rootNode: Node, position: vscode.Position): Node | null {
  const row = position.line;
  const col = position.character;

  function search(node: Node): Node | null {
    if (
      row < node.startPosition.row ||
      row > node.endPosition.row ||
      (row === node.startPosition.row && col < node.startPosition.column) ||
      (row === node.endPosition.row && col > node.endPosition.column)
    ) {
      return null;
    }

    for (const child of node.children) {
      const result = search(child);
      if (result) {
        return result;
      }
    }

    return node;
  }

  return search(rootNode);
}

/**
 * Convert a tree-sitter node to a VS Code location.
 */
export function toLocation(node: Node, uri: string): vscode.Location {
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
