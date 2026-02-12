import * as vscode from 'vscode';
import { ABNFParser } from '../parser';

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
