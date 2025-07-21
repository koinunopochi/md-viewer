import { PathResolver } from './PathResolver';
import * as path from 'path';

describe('PathResolver', () => {
  let pathResolver: PathResolver;
  const baseDir = '/Users/test/documents';

  beforeEach(() => {
    pathResolver = new PathResolver(baseDir);
  });

  describe('resolvePath', () => {
    it('should resolve relative paths correctly', () => {
      // Given
      const relativePath = 'subfolder/file.md';

      // When
      const resolvedPath = pathResolver.resolvePath(relativePath);

      // Then
      expect(resolvedPath).toBe(path.join(baseDir, relativePath));
    });

    it('should handle absolute paths within base directory', () => {
      // Given
      const absolutePath = path.join(baseDir, 'subfolder/file.md');

      // When
      const resolvedPath = pathResolver.resolvePath(absolutePath);

      // Then
      expect(resolvedPath).toBe(absolutePath);
    });

    it('should normalize paths with ..', () => {
      // Given
      const pathWithDots = 'subfolder/../file.md';

      // When
      const resolvedPath = pathResolver.resolvePath(pathWithDots);

      // Then
      expect(resolvedPath).toBe(path.join(baseDir, 'file.md'));
    });
  });

  describe('isPathSafe', () => {
    it('should return true for paths within base directory', () => {
      // Given
      const safePath = 'subfolder/file.md';

      // When
      const isSafe = pathResolver.isPathSafe(safePath);

      // Then
      expect(isSafe).toBe(true);
    });

    it('should return false for paths outside base directory', () => {
      // Given
      const unsafePath = '../../../etc/passwd';

      // When
      const isSafe = pathResolver.isPathSafe(unsafePath);

      // Then
      expect(isSafe).toBe(false);
    });

    it('should return false for paths with .. that escape base directory', () => {
      // Given
      const escapingPath = 'subfolder/../../..';

      // When
      const isSafe = pathResolver.isPathSafe(escapingPath);

      // Then
      expect(isSafe).toBe(false);
    });
  });

  describe('getRelativePath', () => {
    it('should return relative path from base directory', () => {
      // Given
      const absolutePath = path.join(baseDir, 'subfolder/file.md');

      // When
      const relativePath = pathResolver.getRelativePath(absolutePath);

      // Then
      expect(relativePath).toBe('subfolder/file.md');
    });

    it('should return empty string for base directory itself', () => {
      // Given
      const absolutePath = baseDir;

      // When
      const relativePath = pathResolver.getRelativePath(absolutePath);

      // Then
      expect(relativePath).toBe('');
    });
  });

  describe('isExcluded', () => {
    it('should exclude paths matching default patterns', () => {
      // Given
      const nodModulesPath = 'node_modules/package/index.js';

      // When
      const isExcluded = pathResolver.isExcluded(nodModulesPath);

      // Then
      expect(isExcluded).toBe(true);
    });

    it('should exclude paths matching custom patterns', () => {
      // Given
      pathResolver = new PathResolver(baseDir, [/test\.md$/]);
      const testPath = 'folder/test.md';

      // When
      const isExcluded = pathResolver.isExcluded(testPath);

      // Then
      expect(isExcluded).toBe(true);
    });

    it('should not exclude paths that do not match any pattern', () => {
      // Given
      const normalPath = 'docs/readme.md';

      // When
      const isExcluded = pathResolver.isExcluded(normalPath);

      // Then
      expect(isExcluded).toBe(false);
    });
  });
});