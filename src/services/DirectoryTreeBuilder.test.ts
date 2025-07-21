import { DirectoryTreeBuilder } from './DirectoryTreeBuilder';
import { IFileService } from '../interfaces/IFileService';
import { IPathResolver } from '../interfaces/IPathResolver';
import * as fs from 'fs/promises';

// Mock implementations
class MockFileService implements IFileService {
  async readFile(filePath: string): Promise<string> {
    return '';
  }
  async fileExists(filePath: string): Promise<boolean> {
    return true;
  }
  isMarkdownFile(filePath: string): boolean {
    return filePath.endsWith('.md');
  }
  isHtmlFile(filePath: string): boolean {
    return filePath.endsWith('.html') || filePath.endsWith('.htm');
  }
}

class MockPathResolver implements IPathResolver {
  resolvePath(filePath: string): string {
    return filePath;
  }
  isPathSafe(filePath: string): boolean {
    return true;
  }
  getRelativePath(absolutePath: string): string {
    return absolutePath;
  }
  isExcluded(filePath: string): boolean {
    return false;
  }
}

jest.mock('fs/promises');

describe('DirectoryTreeBuilder', () => {
  let builder: DirectoryTreeBuilder;
  let mockFileService: IFileService;
  let mockPathResolver: IPathResolver;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    mockFileService = new MockFileService();
    mockPathResolver = new MockPathResolver();
    builder = new DirectoryTreeBuilder(mockFileService, mockPathResolver);
    jest.clearAllMocks();
  });

  describe('buildTree', () => {
    it('should build a tree for a simple directory', async () => {
      // Given
      const baseDir = '/test';
      mockFs.readdir.mockResolvedValue([
        { name: 'file1.md', isDirectory: () => false, isFile: () => true },
        { name: 'file2.html', isDirectory: () => false, isFile: () => true },
        { name: 'file3.txt', isDirectory: () => false, isFile: () => true },
      ] as any);

      // When
      const tree = await builder.buildTree(baseDir, false);

      // Then
      expect(tree.name).toBe('test');
      expect(tree.type).toBe('directory');
      expect(tree.children).toHaveLength(2); // Only .md and .html files
      expect(tree.children[0].name).toBe('file1.md');
      expect(tree.children[1].name).toBe('file2.html');
    });

    it('should handle subdirectories recursively', async () => {
      // Given
      const baseDir = '/test';
      mockFs.readdir
        .mockResolvedValueOnce([
          { name: 'subdir', isDirectory: () => true, isFile: () => false },
          { name: 'file1.md', isDirectory: () => false, isFile: () => true },
        ] as any)
        .mockResolvedValueOnce([
          { name: 'nested.md', isDirectory: () => false, isFile: () => true },
        ] as any);

      // When
      const tree = await builder.buildTree(baseDir, true);

      // Then
      expect(tree.children).toHaveLength(2);
      expect(tree.children[0].name).toBe('subdir');
      expect(tree.children[0].type).toBe('directory');
      expect(tree.children[0].children).toHaveLength(1);
      expect(tree.children[0].children[0].name).toBe('nested.md');
    });

    it('should not recurse when recursive is false', async () => {
      // Given
      const baseDir = '/test';
      mockFs.readdir.mockResolvedValue([
        { name: 'subdir', isDirectory: () => true, isFile: () => false },
        { name: 'file1.md', isDirectory: () => false, isFile: () => true },
      ] as any);

      // When
      const tree = await builder.buildTree(baseDir, false);

      // Then
      expect(tree.children).toHaveLength(1); // Only file1.md, no subdir
      expect(tree.children[0].name).toBe('file1.md');
    });

    it('should exclude files based on PathResolver', async () => {
      // Given
      const baseDir = '/test';
      mockFs.readdir.mockResolvedValue([
        { name: 'file1.md', isDirectory: () => false, isFile: () => true },
        { name: 'excluded.md', isDirectory: () => false, isFile: () => true },
      ] as any);
      
      jest.spyOn(mockPathResolver, 'isExcluded').mockImplementation((path) => {
        return path.includes('excluded');
      });

      // When
      const tree = await builder.buildTree(baseDir, false);

      // Then
      expect(tree.children).toHaveLength(1);
      expect(tree.children[0].name).toBe('file1.md');
    });

    it('should handle empty directories', async () => {
      // Given
      const baseDir = '/empty';
      mockFs.readdir.mockResolvedValue([]);

      // When
      const tree = await builder.buildTree(baseDir, false);

      // Then
      expect(tree.name).toBe('empty');
      expect(tree.children).toHaveLength(0);
    });

    it('should handle read errors gracefully', async () => {
      // Given
      const baseDir = '/error';
      mockFs.readdir.mockRejectedValue(new Error('Permission denied'));

      // When
      const tree = await builder.buildTree(baseDir, false);

      // Then
      expect(tree.name).toBe('error');
      expect(tree.children).toHaveLength(0);
    });
  });

  describe('getFileCount', () => {
    it('should count files in a tree', async () => {
      // Given
      const baseDir = '/test';
      mockFs.readdir
        .mockResolvedValueOnce([
          { name: 'subdir', isDirectory: () => true, isFile: () => false },
          { name: 'file1.md', isDirectory: () => false, isFile: () => true },
        ] as any)
        .mockResolvedValueOnce([
          { name: 'nested1.md', isDirectory: () => false, isFile: () => true },
          { name: 'nested2.html', isDirectory: () => false, isFile: () => true },
        ] as any);

      // When
      const tree = await builder.buildTree(baseDir, true);
      const count = builder.getFileCount(tree);

      // Then
      expect(count).toBe(3); // file1.md, nested1.md, nested2.html
    });

    it('should return 0 for empty tree', async () => {
      // Given
      const baseDir = '/empty';
      mockFs.readdir.mockResolvedValue([]);

      // When
      const tree = await builder.buildTree(baseDir, false);
      const count = builder.getFileCount(tree);

      // Then
      expect(count).toBe(0);
    });
  });
});