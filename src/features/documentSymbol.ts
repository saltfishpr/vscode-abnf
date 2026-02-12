import * as vscode from 'vscode';
import { ABNFParser } from '../parser';

export function registerDocumentSymbolProvider(parser: ABNFParser): vscode.Disposable {
  return vscode.languages.registerDocumentSymbolProvider('abnf', {
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
  });
}
