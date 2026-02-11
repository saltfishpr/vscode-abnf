import * as vscode from 'vscode';

type Parser = any;
type Language = any;
type Tree = any;
type SyntaxNode = any;
type Query = any;
type Point = any;

let parser: Parser | null = null;
let language: Language | null = null;

export async function getParser(): Promise<Parser> {
  if (!parser) {
    const treeSitter = await import('tree-sitter');
    parser = new treeSitter.default();
  }
  return parser;
}

export async function getLanguage(): Promise<Language> {
  if (!language) {
    const parser = await getParser();
    const abnf = await import('tree-sitter-abnf');
    language = abnf.default;
    parser.setLanguage(language);
  }
  return language;
}

export async function parseDocument(document: vscode.TextDocument): Promise<Tree | null> {
  try {
    const parser = await getParser();
    const tree = parser.parse(document.getText());
    return tree;
  } catch (error) {
    console.error('Failed to parse ABNF document:', error);
    return null;
  }
}

export function findRuleByName(tree: Tree | null, ruleName: string): SyntaxNode | null {
  if (!tree) {
    return null;
  }

  const treeSitter = require('tree-sitter');
  const query = new treeSitter.Query(
    language,
    `(rule (rulename) @name (#match? @name "${ruleName}"))`,
  );

  const matches = query.matches(tree.rootNode);
  if (matches.length > 0) {
    return matches[0].captures[0].node.parent ?? null;
  }

  return null;
}

export function findAllRulenameNodes(tree: Tree | null): SyntaxNode[] {
  if (!tree) {
    return [];
  }

  const nodes: SyntaxNode[] = [];
  const treeSitter = require('tree-sitter');
  const query = new treeSitter.Query(language, `(rule (rulename) @name)`);

  const matches = query.matches(tree.rootNode);
  for (const match of matches) {
    for (const capture of match.captures) {
      nodes.push(capture.node);
    }
  }

  return nodes;
}

export function findAllRulenameReferences(tree: Tree | null, ruleName: string): SyntaxNode[] {
  if (!tree) {
    return [];
  }

  const nodes: SyntaxNode[] = [];

  function traverse(node: SyntaxNode) {
    if (node.type === 'rulename') {
      const text = node.text;
      if (text.toLowerCase() === ruleName.toLowerCase()) {
        nodes.push(node);
      }
    }

    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(tree.rootNode);
  return nodes;
}

export function getNodeAtPosition(tree: Tree | null, position: vscode.Position): SyntaxNode | null {
  if (!tree) {
    return null;
  }

  const { row, column } = positionToTreeSitterPoint(position);

  function findNode(node: SyntaxNode): SyntaxNode | null {
    if (!node) {
      return null;
    }

    const { startPosition, endPosition } = node;

    if (
      row < startPosition.row ||
      (row === startPosition.row && column < startPosition.column) ||
      row > endPosition.row ||
      (row === endPosition.row && column >= endPosition.column)
    ) {
      return null;
    }

    for (const child of node.children) {
      const result = findNode(child);
      if (result) {
        return result;
      }
    }

    return node;
  }

  return findNode(tree.rootNode);
}

export function nodeToRange(node: SyntaxNode): vscode.Range {
  return new vscode.Range(
    treeSitterPointToPosition(node.startPosition),
    treeSitterPointToPosition(node.endPosition),
  );
}

export function positionToTreeSitterPoint(position: vscode.Position): Point {
  return { row: position.line, column: position.character };
}

export function treeSitterPointToPosition(point: Point): vscode.Position {
  return new vscode.Position(point.row, point.column);
}

export function extractRuleName(node: SyntaxNode): string | null {
  if (node.type === 'rulename') {
    return node.text;
  }

  for (const child of node.children) {
    if (child.type === 'rulename') {
      return child.text;
    }
  }

  return null;
}

export function findRuleDefinitionNode(tree: Tree | null, ruleName: string): SyntaxNode | null {
  const rule = findRuleByName(tree, ruleName);
  if (!rule) {
    return null;
  }

  for (const child of rule.children) {
    if (child.type === 'rulename') {
      return child;
    }
  }

  return null;
}
