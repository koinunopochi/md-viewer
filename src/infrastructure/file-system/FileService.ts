import * as fs from 'fs/promises';
import * as path from 'path';
import { IFileService } from '../../domain/interfaces/IFileService';

export class FileService implements IFileService {
  async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  isMarkdownFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.md';
  }

  isHtmlFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.html' || ext === '.htm';
  }

  isCsvFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.csv';
  }

  isImageFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.ico'].includes(ext);
  }
}