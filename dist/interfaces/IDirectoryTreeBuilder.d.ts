import { TreeNode } from '../models/TreeNode';
export interface IDirectoryTreeBuilder {
    buildTree(dir: string, recursive: boolean): Promise<TreeNode>;
    getFileCount(node: TreeNode): number;
}
//# sourceMappingURL=IDirectoryTreeBuilder.d.ts.map