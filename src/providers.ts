import * as vscode from 'vscode';
import { registerDefinitionProvider } from './features/definition';
import { registerDocumentListeners } from './features/documentListeners';
import { registerDocumentSymbolProvider } from './features/documentSymbol';
import { registerReferenceProvider } from './features/references';
import { ABNFParser } from './parser';

export { registerDocumentListeners, registerProviders };

function registerProviders(parser: ABNFParser): vscode.Disposable[] {
  return [
    registerDefinitionProvider(parser),
    registerReferenceProvider(parser),
    registerDocumentSymbolProvider(parser),
  ];
}
