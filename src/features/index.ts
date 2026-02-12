import * as vscode from 'vscode';
import { ABNFParser } from '../parser';
import { registerDefinitionProvider } from './definition';
import { registerDocumentListeners } from './documentListeners';
import { registerDocumentSymbolProvider } from './documentSymbol';
import { registerHoverProvider } from './hover';
import { registerReferenceProvider } from './references';
import { registerRenameProvider } from './rename';

export { registerDocumentListeners, registerProviders };

function registerProviders(parser: ABNFParser): vscode.Disposable[] {
  return [
    registerDefinitionProvider(parser),
    registerReferenceProvider(parser),
    registerDocumentSymbolProvider(parser),
    registerHoverProvider(parser),
    registerRenameProvider(parser),
  ];
}
