export declare class TreeNode {
    name: string;
    type: 'directory' | 'file';
    relativePath: string;
    children: TreeNode[];
    constructor(name: string, type?: 'directory' | 'file', relativePath?: string);
    addChild(child: TreeNode): void;
}
//# sourceMappingURL=TreeNode.d.ts.map