import * as vscode from 'vscode';
import { Language, Node, Parser } from 'web-tree-sitter';
import { logger } from './logger';
import { ParsedDocument, RuleDefinition } from './types';

export class ABNFParser {
  private parser: Parser | null = null;
  private readonly documents = new Map<string, ParsedDocument>();

  async init(wasmPath: string): Promise<void> {
    logger.debug('Loading tree-sitter WASM...');
    await Parser.init();
    this.parser = new Parser();

    logger.debug('Loading ABNF language from WASM...');
    const language = await Language.load(wasmPath);
    this.parser.setLanguage(language);
    logger.info('ABNF language loaded and parser ready');
  }

  parse(document: vscode.TextDocument): ParsedDocument | null {
    if (!this.parser) {
      logger.warn('Parser not initialized, cannot parse document:', document.uri.toString());
      return null;
    }

    const uri = document.uri.toString();
    logger.debug(`Parsing document: ${uri}`);

    const tree = this.parser.parse(document.getText());
    if (!tree) {
      return null;
    }

    const definitions: RuleDefinition[] = [];
    const references = new Map<string, Node[]>();

    const rootNode = tree.rootNode;

    this.collectDefinitionsAndReferences(rootNode, uri, definitions, references);

    const parsedDoc: ParsedDocument = {
      uri,
      tree,
      definitions,
      references,
    };

    this.documents.set(uri, parsedDoc);
    return parsedDoc;
  }

  /**
   * Traverse the syntax tree to collect rule definitions and references.
   */
  private collectDefinitionsAndReferences(
    node: Node,
    uri: string,
    definitions: RuleDefinition[],
    references: Map<string, Node[]>,
  ): void {
    if (node.type === 'rule') {
      for (const child of node.children) {
        if (child.type === 'rulename') {
          const ruleName = child.text;
          definitions.push({ name: ruleName, node: child, uri });
        }
      }
    }

    if (node.type === 'rulename' || node.type === 'core_rulename') {
      const parent = node.parent;
      if (parent && parent.type !== 'rule') {
        const ruleName = node.text;
        if (!references.has(ruleName)) {
          references.set(ruleName, []);
        }
        references.get(ruleName)!.push(node);
      }
    }

    for (const child of node.children) {
      this.collectDefinitionsAndReferences(child, uri, definitions, references);
    }
  }

  getDocument(uri: string): ParsedDocument | undefined {
    return this.documents.get(uri);
  }

  invalidateDocument(uri: string): void {
    const doc = this.documents.get(uri);
    if (doc) {
      logger.debug(`Invalidating document: ${uri}`);
      doc.tree.delete();
      this.documents.delete(uri);
    }
  }

  dispose(): void {
    const count = this.documents.size;
    logger.debug(`Disposing parser (${count} documents in cache)`);
    for (const doc of this.documents.values()) {
      doc.tree.delete();
    }
    this.documents.clear();
    this.parser?.delete();
    logger.info('Parser disposed');
  }
}
