import { TreeNode } from '../entities/TreeNode';

export interface IDirectoryTreeBuilder {
  buildTree(dir: string, recursive: boolean): Promise<TreeNode>;
  getFileCount(node: TreeNode): number;
}