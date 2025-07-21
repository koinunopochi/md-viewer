"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeNode = void 0;
class TreeNode {
    constructor(name, type = 'directory', relativePath = '') {
        this.name = name;
        this.type = type;
        this.relativePath = relativePath;
        this.children = [];
    }
    addChild(child) {
        this.children.push(child);
    }
}
exports.TreeNode = TreeNode;
//# sourceMappingURL=TreeNode.js.map