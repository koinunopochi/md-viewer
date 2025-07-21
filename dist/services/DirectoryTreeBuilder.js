"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryTreeBuilder = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const TreeNode_1 = require("../models/TreeNode");
class DirectoryTreeBuilder {
    constructor(fileService, pathResolver) {
        this.fileService = fileService;
        this.pathResolver = pathResolver;
    }
    async buildTree(dir, recursive) {
        const dirName = path.basename(dir);
        const rootNode = new TreeNode_1.TreeNode(dirName, 'directory', '');
        try {
            await this.buildTreeRecursive(dir, dir, rootNode, recursive);
        }
        catch (error) {
            // Return empty tree on error
            console.error(`Error building tree for ${dir}:`, error);
        }
        return rootNode;
    }
    async buildTreeRecursive(currentDir, baseDir, parentNode, recursive) {
        try {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });
            // Process directories first
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                const relativePath = path.relative(baseDir, fullPath);
                if (this.pathResolver.isExcluded(relativePath)) {
                    continue;
                }
                if (entry.isDirectory() && recursive) {
                    const dirNode = new TreeNode_1.TreeNode(entry.name, 'directory', relativePath);
                    parentNode.addChild(dirNode);
                    await this.buildTreeRecursive(fullPath, baseDir, dirNode, recursive);
                }
            }
            // Process files
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                const relativePath = path.relative(baseDir, fullPath);
                if (this.pathResolver.isExcluded(relativePath)) {
                    continue;
                }
                if (entry.isFile() &&
                    (this.fileService.isMarkdownFile(entry.name) ||
                        this.fileService.isHtmlFile(entry.name))) {
                    const fileNode = new TreeNode_1.TreeNode(entry.name, 'file', relativePath);
                    parentNode.addChild(fileNode);
                }
            }
        }
        catch (error) {
            console.error(`Error reading directory ${currentDir}:`, error);
        }
    }
    getFileCount(node) {
        if (node.type === 'file') {
            return 1;
        }
        return node.children.reduce((count, child) => {
            return count + this.getFileCount(child);
        }, 0);
    }
}
exports.DirectoryTreeBuilder = DirectoryTreeBuilder;
//# sourceMappingURL=DirectoryTreeBuilder.js.map