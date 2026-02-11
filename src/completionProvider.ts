import * as vscode from 'vscode';
import { parseDocument, findAllRulenameNodes, nodeToRange } from './parser';

const CORE_RULES = [
  'ALPHA',
  'BIT',
  'CHAR',
  'CR',
  'CRLF',
  'CTL',
  'DIGIT',
  'DQUOTE',
  'HEXDIG',
  'HTAB',
  'LF',
  'LWSP',
  'OCTET',
  'SP',
  'VCHAR',
  'WSP',
];

export class AbnfCompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext,
  ): Promise<vscode.CompletionItem[]> {
    const tree = await parseDocument(document);
    if (!tree) {
      return [];
    }

    const items: vscode.CompletionItem[] = [];
    const definedRules = new Set<string>();

    const ruleNodes = findAllRulenameNodes(tree);
    for (const node of ruleNodes) {
      const ruleName = node.text;
      definedRules.add(ruleName);
    }

    for (const ruleName of definedRules) {
      const item = new vscode.CompletionItem(ruleName, vscode.CompletionItemKind.Function);
      item.detail = 'ABNF rule';
      items.push(item);
    }

    for (const coreRule of CORE_RULES) {
      const item = new vscode.CompletionItem(coreRule, vscode.CompletionItemKind.Constant);
      item.detail = 'Core rule (RFC 5234)';
      item.documentation = `RFC 5234 core rule: ${coreRule}`;
      items.push(item);
    }

    return items;
  }
}
