import { IFileService } from '../interfaces/IFileService';
import { IPathResolver } from '../interfaces/IPathResolver';
import { IDirectoryTreeBuilder } from '../interfaces/IDirectoryTreeBuilder';
import { TreeNode } from '../models/TreeNode';
export declare class DirectoryTreeBuilder implements IDirectoryTreeBuilder {
    private fileService;
    private pathResolver;
    constructor(fileService: IFileService, pathResolver: IPathResolver);
    buildTree(dir: string, recursive: boolean): Promise<TreeNode>;
    private buildTreeRecursive;
    getFileCount(node: TreeNode): number;
}
//# sourceMappingURL=DirectoryTreeBuilder.d.ts.map