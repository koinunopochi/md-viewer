export interface IPathResolver {
  resolvePath(filePath: string): string;
  isPathSafe(filePath: string): boolean;
  getRelativePath(absolutePath: string): string;
  isExcluded(filePath: string): boolean;
}