import * as path from 'path';
import { IPathResolver } from '../../domain/interfaces/IPathResolver';

export class PathResolver implements IPathResolver {
  private baseDir: string;
  private excludePatterns: RegExp[];
  private defaultExcludePatterns: RegExp[] = [
    /node_modules/,
    /\.git/,
    /\.next/,
    /dist/,
    /build/,
    /coverage/,
    /\.cache/,
    /\.vscode/,
    /\.idea/
  ];

  constructor(baseDir: string, customExcludePatterns: RegExp[] = []) {
    this.baseDir = path.resolve(baseDir);
    this.excludePatterns = [...this.defaultExcludePatterns, ...customExcludePatterns];
  }

  resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return path.normalize(filePath);
    }
    return path.resolve(this.baseDir, filePath);
  }

  isPathSafe(filePath: string): boolean {
    const resolvedPath = this.resolvePath(filePath);
    const normalizedPath = path.normalize(resolvedPath);
    return normalizedPath.startsWith(this.baseDir);
  }

  getRelativePath(absolutePath: string): string {
    return path.relative(this.baseDir, absolutePath);
  }

  isExcluded(filePath: string): boolean {
    return this.excludePatterns.some(pattern => pattern.test(filePath));
  }
}