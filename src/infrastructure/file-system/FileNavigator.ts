import * as fs from 'fs/promises';
import * as path from 'path';
import { IFileNavigator } from '../../domain/interfaces/IFileNavigator';
import { IFileService } from '../../domain/interfaces/IFileService';
import { IPathResolver } from '../../domain/interfaces/IPathResolver';
import { FileNavigation, NavigationFile } from '../../domain/entities/FileNavigation';

export class FileNavigator implements IFileNavigator {
  constructor(
    private fileService: IFileService,
    private pathResolver: IPathResolver,
    private baseDir: string
  ) {}

  async getNavigation(currentFilePath: string): Promise<FileNavigation> {
    const currentDir = path.dirname(currentFilePath);
    const currentFileName = path.basename(currentFilePath);
    
    // Get files in current directory
    const currentDirFiles = await this.getViewableFiles(currentDir);
    const currentIndex = currentDirFiles.findIndex(file => file.name === currentFileName);
    
    // Get parent directory info
    const parentDir = path.dirname(currentDir);
    let parentFile: NavigationFile | undefined;
    let parentDirFiles: NavigationFile[] = [];
    
    if (parentDir !== currentDir && this.isWithinBaseDir(parentDir)) {
      parentDirFiles = await this.getViewableFiles(parentDir);
      // Find a representative file in parent directory (prefer README.md)
      const readmeFile = parentDirFiles.find(f => f.name.toLowerCase() === 'readme.md');
      parentFile = readmeFile || parentDirFiles[0];
    }
    
    // Get child directory files
    const childDirFiles: NavigationFile[] = [];
    try {
      const entries = await fs.readdir(path.join(this.baseDir, currentDir), { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !this.pathResolver.isExcluded(entry.name)) {
          const childDir = path.join(currentDir, entry.name);
          const childFiles = await this.getViewableFiles(childDir);
          // Add the first file from each child directory
          if (childFiles.length > 0) {
            childDirFiles.push(childFiles[0]);
          }
        }
      }
    } catch (error) {
      // Ignore errors when reading child directories
    }
    
    return {
      previous: currentIndex > 0 ? currentDirFiles[currentIndex - 1] : undefined,
      next: currentIndex < currentDirFiles.length - 1 ? currentDirFiles[currentIndex + 1] : undefined,
      parent: parentFile,
      siblings: currentDirFiles.filter((_, index) => index !== currentIndex),
      children: childDirFiles
    };
  }

  private async getViewableFiles(dir: string): Promise<NavigationFile[]> {
    const files: NavigationFile[] = [];
    
    try {
      const fullPath = path.join(this.baseDir, dir);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && this.isViewableFile(entry.name)) {
          const relativePath = path.join(dir, entry.name);
          if (!this.pathResolver.isExcluded(relativePath)) {
            files.push({
              path: relativePath,
              name: entry.name,
              type: this.getFileType(entry.name)
            });
          }
        }
      }
      
      // Sort files alphabetically
      files.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      // Return empty array on error
    }
    
    return files;
  }

  private isViewableFile(filename: string): boolean {
    return this.fileService.isMarkdownFile(filename) ||
           this.fileService.isHtmlFile(filename) ||
           this.fileService.isCsvFile(filename) ||
           this.fileService.isImageFile(filename);
  }

  private getFileType(filename: string): 'markdown' | 'html' | 'csv' | 'image' {
    if (this.fileService.isMarkdownFile(filename)) return 'markdown';
    if (this.fileService.isHtmlFile(filename)) return 'html';
    if (this.fileService.isCsvFile(filename)) return 'csv';
    if (this.fileService.isImageFile(filename)) return 'image';
    throw new Error(`Unknown file type: ${filename}`);
  }

  private isWithinBaseDir(dir: string): boolean {
    const resolvedDir = path.resolve(this.baseDir, dir);
    const resolvedBase = path.resolve(this.baseDir);
    return resolvedDir.startsWith(resolvedBase);
  }
}