import * as vscode from 'vscode';
import { parseDocument, nodeToRange } from './parser';

export class AbnfDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  async provideDocumentSymbols(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): Promise<vscode.DocumentSymbol[]> {
    const tree = await parseDocument(document);
    if (!tree) {
      return [];
    }

    const symbols: vscode.DocumentSymbol[] = [];
    const treeSitter = require('tree-sitter');
    const query = new treeSitter.Query(
      require('tree-sitter-abnf').default,
      `(rule (rulename) @name (elements) @body)`,
    );

    const matches = query.matches(tree.rootNode);

    for (const match of matches) {
      const nameNode = match.captures[0]?.node;
      const bodyNode = match.captures[1]?.node;

      if (nameNode) {
        const name = nameNode.text;
        const ruleNode = nameNode.parent ?? nameNode;
        const range = nodeToRange(ruleNode);
        const selectionRange = nodeToRange(nameNode);

        const symbol = new vscode.DocumentSymbol(
          name,
          'ABNF rule',
          vscode.SymbolKind.Function,
          range,
          selectionRange,
        );

        symbols.push(symbol);
      }
    }

    return symbols;
  }
}
