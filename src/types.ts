import { Node, Tree } from 'web-tree-sitter';

export interface ParsedDocument {
  uri: string;
  tree: Tree;
  definitions: RuleDefinition[];
  references: Map<string, Node[]>;
}

export interface RuleDefinition {
  name: string;
  node: Node;
  uri: string;
}
