import * as vscode from 'vscode';
import { ABNFParser } from './parser';
import { Node } from 'web-tree-sitter';

export function registerProviders(parser: ABNFParser): vscode.Disposable[] {
  return [
    vscode.languages.registerDefinitionProvider('abnf', {
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
    }),

    vscode.languages.registerReferenceProvider('abnf', {
      provideReferences(document, position, _context) {
        const parsed = parser.getDocument(document.uri.toString());
        if (!parsed) {
          return [];
        }

        const targetNode = parser.getTargetNode(parsed.tree, document.offsetAt(position));
        if (!targetNode) {
          return [];
        }

        const results: vscode.Location[] = [];
        const def = parsed.definitions.find((d) => d.name === targetNode.text);
        if (def) {
          results.push(parser.getNodeLocation(def.uri, def.node)!);
        }

        const refNodes = parsed.references.get(targetNode.text);
        if (refNodes) {
          for (const refNode of refNodes) {
            results.push(parser.getNodeLocation(parsed.uri, refNode)!);
          }
        }

        return results;
      },
    }),

    vscode.languages.registerDocumentSymbolProvider('abnf', {
      provideDocumentSymbols(document) {
        const parsed = parser.getDocument(document.uri.toString());
        if (!parsed) {
          return [];
        }

        return parsed.definitions.map((def) => {
          const { startPosition, endPosition } = def.node;
          const range = new vscode.Range(
            new vscode.Position(startPosition.row, startPosition.column),
            new vscode.Position(endPosition.row, endPosition.column),
          );
          return new vscode.DocumentSymbol(
            def.node.text,
            '',
            vscode.SymbolKind.Function,
            range,
            range,
          );
        });
      },
    }) as vscode.Disposable,
  ];
}

/**
 * Get the syntax tree node at a given position.
 */
function getNodeAtPosition(rootNode: Node, position: vscode.Position): Node | null {
  const row = position.line;
  const col = position.character;

  function search(node: Node): Node | null {
    // Check if position is within this node
    if (
      row < node.startPosition.row ||
      row > node.endPosition.row ||
      (row === node.startPosition.row && col < node.startPosition.column) ||
      (row === node.endPosition.row && col > node.endPosition.column)
    ) {
      return null;
    }

    // Search children first (for more specific nodes)
    for (const child of node.children) {
      const result = search(child);
      if (result) {
        return result;
      }
    }

    // Return this node if position is within it
    return node;
  }

  return search(rootNode);
}

/**
 * Convert a tree-sitter node to a VS Code location.
 */
function toLocation(node: Node, uri: string): vscode.Location {
  return new vscode.Location(vscode.Uri.parse(uri), toRange(node));
}

/**
 * Convert a tree-sitter node to a VS Code range.
 */
function toRange(node: Node): vscode.Range {
  return new vscode.Range(
    new vscode.Position(node.startPosition.row, node.startPosition.column),
    new vscode.Position(node.endPosition.row, node.endPosition.column),
  );
}

export function registerDocumentListeners(parser: ABNFParser): vscode.Disposable[] {
  const parseIfAbnf = (doc: vscode.TextDocument) => {
    if (doc.languageId === 'abnf') {
      parser.parse(doc);
    }
  };

  const invalidateIfAbnf = (doc: vscode.TextDocument) => {
    if (doc.languageId === 'abnf') {
      parser.invalidateDocument(doc.uri.toString());
    }
  };

  return [
    vscode.workspace.onDidOpenTextDocument(parseIfAbnf),
    vscode.workspace.onDidChangeTextDocument((e) => parseIfAbnf(e.document)),
    vscode.workspace.onDidCloseTextDocument(invalidateIfAbnf),
  ];
}
