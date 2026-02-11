import * as vscode from 'vscode';
import { parseDocument, getNodeAtPosition, findRuleByName, nodeToRange } from './parser';

const CORE_RULES_DOCS: Record<string, string> = {
  ALPHA: 'ASCII alphabetic characters (A-Z, a-z)',
  BIT: 'Binary digit (0 or 1)',
  CHAR: 'Any US-ASCII character (octets 0-127)',
  CR: 'Carriage return',
  CRLF: 'Internet standard newline (CRLF)',
  CTL: 'Control characters',
  DIGIT: 'Decimal digit (0-9)',
  DQUOTE: 'Double quote',
  HEXDIG: 'Hexadecimal digit (0-9, A-F, a-f)',
  HTAB: 'Horizontal tab',
  LF: 'Linefeed',
  LWSP: 'Linear white space (per RFC 7405)',
  OCTET: 'Any octet (8-bit data)',
  SP: 'Space',
  VCHAR: 'Visible (printing) characters',
  WSP: 'White space (SP or HTAB)',
};

function isCoreRule(ruleName: string): boolean {
  return ruleName.toUpperCase() in CORE_RULES_DOCS;
}

export class AbnfHoverProvider implements vscode.HoverProvider {
  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): Promise<vscode.Hover | undefined> {
    const tree = await parseDocument(document);
    if (!tree) {
      return undefined;
    }

    const node = getNodeAtPosition(tree, position);
    if (!node || (node.type !== 'rulename' && node.parent?.type !== 'rulename')) {
      return undefined;
    }

    const ruleNameNode = node.type === 'rulename' ? node : node.parent;
    if (!ruleNameNode) {
      return undefined;
    }

    const ruleName = ruleNameNode.text;
    const upperRuleName = ruleName.toUpperCase();

    if (isCoreRule(ruleName)) {
      const doc = CORE_RULES_DOCS[upperRuleName];
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**${ruleName}**\n\n`);
      markdown.appendMarkdown(`*Core rule (RFC 5234)*\n\n`);
      markdown.appendMarkdown(doc);
      return new vscode.Hover(markdown, nodeToRange(ruleNameNode));
    }

    const ruleNode = findRuleByName(tree, ruleName);
    if (!ruleNode) {
      return undefined;
    }

    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`**${ruleName}**\n\n`);

    const elementsNode = ruleNode.children.find((c: any) => c.type === 'elements');
    if (elementsNode) {
      const definition = elementsNode.text.trim();
      markdown.appendCodeblock(definition, 'abnf');
    }

    return new vscode.Hover(markdown, nodeToRange(ruleNameNode));
  }
}
