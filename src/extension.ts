import * as vscode from 'vscode';
import { AbnfDocumentSymbolProvider } from './documentSymbolProvider';
import { AbnfDefinitionProvider } from './definitionProvider';
import { AbnfReferenceProvider, AbnfImplementationProvider } from './referenceProvider';
import { AbnfCompletionProvider } from './completionProvider';
import { AbnfHoverProvider } from './hoverProvider';

export function activate(context: vscode.ExtensionContext): void {
  const documentSymbolProvider = new AbnfDocumentSymbolProvider();
  const definitionProvider = new AbnfDefinitionProvider();
  const referenceProvider = new AbnfReferenceProvider();
  const implementationProvider = new AbnfImplementationProvider();
  const completionProvider = new AbnfCompletionProvider();
  const hoverProvider = new AbnfHoverProvider();

  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      { language: 'abnf', scheme: 'file' },
      documentSymbolProvider,
    ),
  );

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      { language: 'abnf', scheme: 'file' },
      definitionProvider,
    ),
  );

  context.subscriptions.push(
    vscode.languages.registerReferenceProvider(
      { language: 'abnf', scheme: 'file' },
      referenceProvider,
    ),
  );

  context.subscriptions.push(
    vscode.languages.registerImplementationProvider(
      { language: 'abnf', scheme: 'file' },
      implementationProvider,
    ),
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { language: 'abnf', scheme: 'file' },
      completionProvider,
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ),
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider({ language: 'abnf', scheme: 'file' }, hoverProvider),
  );
}

export function deactivate(): void {}
