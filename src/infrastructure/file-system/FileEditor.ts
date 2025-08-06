import * as fs from 'fs/promises';
import * as path from 'path';
import { EditRequest, IFileEditor } from '../../domain/interfaces/IFileEditor';

export class FileEditor implements IFileEditor {
  constructor(private baseDir: string) {}

  async editFile(request: EditRequest): Promise<void> {
    // セキュリティチェック
    const resolvedPath = path.resolve(this.baseDir, request.filePath);
    if (!resolvedPath.startsWith(this.baseDir)) {
      throw new Error('Invalid file path');
    }

    try {
      // ファイルの読み込み
      const content = await fs.readFile(resolvedPath, 'utf-8');
      
      // テキスト置換
      const escapedOriginalText = this.escapeRegExp(request.originalText);
      const regex = new RegExp(escapedOriginalText, 'g');
      
      // 最初のマッチのみを置換
      let replaced = false;
      const newContent = content.replace(regex, (match) => {
        if (!replaced) {
          replaced = true;
          return request.newText;
        }
        return match;
      });
      
      if (!replaced) {
        throw new Error('指定されたテキストが見つかりませんでした');
      }
      
      // ファイルの書き込み
      await fs.writeFile(resolvedPath, newContent, 'utf-8');
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        throw new Error('ファイルが見つかりません');
      }
      throw error;
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}