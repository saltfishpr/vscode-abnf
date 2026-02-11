import * as vscode from 'vscode';
import { ABNFParser } from './parser';
import { registerDocumentListeners, registerProviders } from './providers';

const parser = new ABNFParser();

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  await parser.init();

  vscode.workspace.textDocuments.forEach((doc) => {
    if (doc.languageId === 'abnf') {
      parser.parse(doc);
    }
  });

  context.subscriptions.push(...registerDocumentListeners(parser));
  context.subscriptions.push(...registerProviders(parser));
}

export function deactivate(): void {
  parser.dispose();
}
