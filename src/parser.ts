// import { Parser } from 'web-tree-sitter/debug';
import { Parser } from 'web-tree-sitter';
import { Language, Node, Tree } from 'web-tree-sitter';
import * as vscode from 'vscode';
import { ParsedDocument, RuleDefinition } from './types';

export class ABNFParser {
  private parser: Parser | null = null;
  private readonly documents = new Map<string, ParsedDocument>();

  async init(wasmPath: string): Promise<void> {
    await Parser.init();
    this.parser = new Parser();

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

    const rootNode = tree.rootNode;

    // Collect rule definitions and references
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
      // A rule node has children: rulename, defined_as, elements, c_nl
      for (const child of node.children) {
        if (child.type === 'rulename') {
          const ruleName = child.text;
          definitions.push({ name: ruleName, node: child, uri });
        }
      }
    }

    // Check if current node is a rulename reference (not a definition)
    // A rulename is a reference if its parent is not a 'rule' node
    if (node.type === 'rulename' || node.type === 'core_rulename') {
      const parent = node.parent;
      // Only collect as reference if parent is not 'rule' (which would make it a definition)
      if (parent && parent.type !== 'rule') {
        const ruleName = node.text;
        if (!references.has(ruleName)) {
          references.set(ruleName, []);
        }
        references.get(ruleName)!.push(node);
      }
    }

    // Recursively process all children
    for (const child of node.children) {
      this.collectDefinitionsAndReferences(child, uri, definitions, references);
    }
  }

  getDocument(uri: string): ParsedDocument | undefined {
    return this.documents.get(uri);
  }

  getTargetNode(tree: Tree, offset: number): Node | null {
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

  getNodeLocation(uri: string, node: Node): vscode.Location | undefined {
    const { startPosition, endPosition } = node;
    const range = new vscode.Range(
      new vscode.Position(startPosition.row, startPosition.column),
      new vscode.Position(endPosition.row, endPosition.column),
    );
    return new vscode.Location(vscode.Uri.parse(uri), range);
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
}
