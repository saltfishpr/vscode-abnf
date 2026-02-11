import * as vscode from 'vscode';
import { ABNFParser } from './parser';

export function registerProviders(parser: ABNFParser): vscode.Disposable[] {
  return [
    vscode.languages.registerDefinitionProvider('abnf', {
      provideDefinition(document, position) {
        return parser.findDefinition(document, position);
      },
    }),
    vscode.languages.registerReferenceProvider('abnf', {
      provideReferences(document, position, _context) {
        return parser.findReferences(document, position);
      },
    }),
    vscode.languages.registerDocumentSymbolProvider('abnf', {
      provideDocumentSymbols(document) {
        return parser.getDocumentSymbols(document);
      },
    }) as vscode.Disposable,
  ];
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
