export class TreeNode {
  name: string;
  type: 'directory' | 'file';
  relativePath: string;
  children: TreeNode[];

  constructor(name: string, type: 'directory' | 'file' = 'directory', relativePath: string = '') {
    this.name = name;
    this.type = type;
    this.relativePath = relativePath;
    this.children = [];
  }

  addChild(child: TreeNode): void {
    this.children.push(child);
  }
}