import * as vscode from 'vscode';
import { logger } from './logger';
import { ABNFParser } from './parser';
import { registerDocumentListeners, registerProviders } from './providers';

const parser = new ABNFParser();

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  logger.info('Extension activating...');

  const wasmPath = vscode.Uri.joinPath(context.extensionUri, 'tree-sitter-abnf.wasm').fsPath;
  logger.debug('Initializing parser with wasm path:', wasmPath);
  await parser.init(wasmPath);
  logger.info('Parser initialized successfully');

  vscode.workspace.textDocuments.forEach((doc) => {
    if (doc.languageId === 'abnf') {
      logger.debug(`Parsing existing document: ${doc.uri.toString()}`);
      parser.parse(doc);
    }
  });

  context.subscriptions.push(...registerDocumentListeners(parser));
  context.subscriptions.push(...registerProviders(parser));
  logger.info('Extension activated successfully');
}

export function deactivate(): void {
  logger.info('Extension deactivating...');
  parser.dispose();
  logger.info('Parser disposed');
  logger.info('Extension deactivated');
}
