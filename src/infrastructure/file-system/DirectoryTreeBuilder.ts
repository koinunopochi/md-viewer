import * as fs from 'fs/promises';
import * as path from 'path';
import { IFileService } from '../../domain/interfaces/IFileService';
import { IPathResolver } from '../../domain/interfaces/IPathResolver';
import { IDirectoryTreeBuilder } from '../../domain/interfaces/IDirectoryTreeBuilder';
import { TreeNode } from '../../domain/entities/TreeNode';

export class DirectoryTreeBuilder implements IDirectoryTreeBuilder {
  constructor(
    private fileService: IFileService,
    private pathResolver: IPathResolver
  ) {}

  async buildTree(dir: string, recursive: boolean): Promise<TreeNode> {
    const dirName = path.basename(dir);
    const rootNode = new TreeNode(dirName, 'directory', '');
    
    try {
      if (recursive) {
        await this.buildTreeRecursive(dir, dir, rootNode, recursive);
      } else {
        // Non-recursive mode: only process files in root directory
        await this.buildRootFiles(dir, rootNode);
      }
    } catch (error) {
      // Return empty tree on error
      console.error(`Error building tree for ${dir}:`, error);
    }
    
    return rootNode;
  }

  private async buildTreeRecursive(
    currentDir: string,
    baseDir: string,
    parentNode: TreeNode,
    recursive: boolean
  ): Promise<void> {
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
          const dirNode = new TreeNode(entry.name, 'directory', relativePath);
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
          const fileNode = new TreeNode(entry.name, 'file', relativePath);
          parentNode.addChild(fileNode);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentDir}:`, error);
    }
  }

  getFileCount(node: TreeNode): number {
    if (node.type === 'file') {
      return 1;
    }
    
    return node.children.reduce((count, child) => {
      return count + this.getFileCount(child);
    }, 0);
  }

  private async buildRootFiles(dir: string, rootNode: TreeNode): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (this.pathResolver.isExcluded(entry.name)) {
          continue;
        }
        
        if (entry.isFile() && 
            (this.fileService.isMarkdownFile(entry.name) || 
             this.fileService.isHtmlFile(entry.name))) {
          const fileNode = new TreeNode(entry.name, 'file', entry.name);
          rootNode.addChild(fileNode);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }
}