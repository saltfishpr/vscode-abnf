import { Node } from 'web-tree-sitter';
import { Tree } from 'web-tree-sitter';

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

export interface RuleReference {
  name: string;
  node: Node;
  uri: string;
}
