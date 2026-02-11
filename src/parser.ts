import { Language, Node, Parser, Tree } from 'web-tree-sitter';
import * as vscode from 'vscode';
import { RuleDefinition } from './types';

export interface ParsedDocument {
  uri: string;
  tree: Tree;
  definitions: RuleDefinition[];
  references: Map<string, Node[]>;
}

export class ABNFParser {
  private parser: Parser | null = null;
  private readonly documents = new Map<string, ParsedDocument>();

  async init(): Promise<void> {
    await Parser.init();
    this.parser = new Parser();

    const wasmPath = require.resolve('tree-sitter-abnf');
    const language = await Language.load(wasmPath);
    this.parser.setLanguage(language);
  }

  parse(document: vscode.TextDocument): ParsedDocument | null {
    if (!this.parser) {
      return null;
    }

    const tree = this.parser.parse(document.getText());
    if (!tree) {
      return null;
    }

    const uri = document.uri.toString();
    const definitions: RuleDefinition[] = [];
    const references = new Map<string, Node[]>();

    this.collectDefinitionsAndReferences(tree.rootNode, uri, definitions, references);

    const parsed: ParsedDocument = { uri, tree, definitions, references };
    this.documents.set(uri, parsed);
    return parsed;
  }

  getDocument(uri: string): ParsedDocument | null {
    return this.documents.get(uri) || null;
  }

  findDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.Location | undefined {
    const parsed = this.getDocument(document.uri.toString());
    if (!parsed) {
      return undefined;
    }

    const targetNode = this.getTargetNode(parsed.tree, document, position);
    if (!targetNode) {
      return undefined;
    }

    const name = targetNode.text.toLowerCase();
    const def = parsed.definitions.find((d) => d.name === name);
    if (def) {
      return this.nodeToLocation(def.node, def.uri);
    }

    return undefined;
  }

  findReferences(document: vscode.TextDocument, position: vscode.Position): vscode.Location[] {
    const parsed = this.getDocument(document.uri.toString());
    if (!parsed) {
      return [];
    }

    const targetNode = this.getTargetNode(parsed.tree, document, position);
    if (!targetNode) {
      return [];
    }

    const name = targetNode.text.toLowerCase();
    const results: vscode.Location[] = [];

    const def = parsed.definitions.find((d) => d.name === name);
    if (def) {
      results.push(this.nodeToLocation(def.node, def.uri)!);
    }

    const refNodes = parsed.references.get(name);
    if (refNodes) {
      for (const refNode of refNodes) {
        results.push(this.nodeToLocation(refNode, parsed.uri)!);
      }
    }

    return results;
  }

  getDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
    const parsed = this.getDocument(document.uri.toString());
    if (!parsed) {
      return [];
    }

    return parsed.definitions.map((def) => {
      const { startPosition, endPosition } = def.node;
      const range = new vscode.Range(
        new vscode.Position(startPosition.row, startPosition.column),
        new vscode.Position(endPosition.row, endPosition.column),
      );
      return new vscode.DocumentSymbol(def.node.text, '', vscode.SymbolKind.Function, range, range);
    });
  }

  invalidateDocument(uri: string): void {
    const doc = this.documents.get(uri);
    if (doc) {
      doc.tree.delete();
      this.documents.delete(uri);
    }
  }

  dispose(): void {
    for (const doc of this.documents.values()) {
      doc.tree.delete();
    }
    this.documents.clear();
    this.parser?.delete();
  }

  private collectDefinitionsAndReferences(
    node: Node,
    uri: string,
    definitions: RuleDefinition[],
    references: Map<string, Node[]>,
  ): void {
    if (node.type === 'rule') {
      const rulenameNode = node.childForFieldName('rulename');
      if (rulenameNode) {
        const name = rulenameNode.text.toLowerCase();
        definitions.push({ name, node: rulenameNode, uri });
      }
    }

    if (node.type === 'rulename' || node.type === 'core_rulename') {
      const parent = node.parent;
      if (parent && parent.type === 'element') {
        const name = node.text.toLowerCase();
        if (!references.has(name)) {
          references.set(name, []);
        }
        references.get(name)!.push(node);
      }
    }

    for (const child of node.children) {
      this.collectDefinitionsAndReferences(child, uri, definitions, references);
    }
  }

  private getTargetNode(
    tree: Tree,
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Node | null {
    const offset = document.offsetAt(position);
    const node = tree.rootNode.descendantForIndex(offset);
    if (!node) {
      return null;
    }

    if (node.type === 'rulename' || node.type === 'core_rulename') {
      return node;
    }
    if (node.parent && (node.parent.type === 'rulename' || node.parent.type === 'core_rulename')) {
      return node.parent;
    }
    return null;
  }

  private nodeToLocation(node: Node, uri: string): vscode.Location | undefined {
    const { startPosition, endPosition } = node;
    const range = new vscode.Range(
      new vscode.Position(startPosition.row, startPosition.column),
      new vscode.Position(endPosition.row, endPosition.column),
    );
    return new vscode.Location(vscode.Uri.parse(uri), range);
  }
}
