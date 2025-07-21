import { FileService } from './FileService';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');

describe('FileService', () => {
  let fileService: FileService;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    fileService = new FileService();
    jest.clearAllMocks();
  });

  describe('readFile', () => {
    it('should read a file and return its content', async () => {
      // Given
      const filePath = '/test/file.md';
      const expectedContent = '# Hello World';
      mockFs.readFile.mockResolvedValue(expectedContent);

      // When
      const content = await fileService.readFile(filePath);

      // Then
      expect(content).toBe(expectedContent);
      expect(mockFs.readFile).toHaveBeenCalledWith(filePath, 'utf-8');
    });

    it('should throw an error when file does not exist', async () => {
      // Given
      const filePath = '/test/nonexistent.md';
      mockFs.readFile.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      // When & Then
      await expect(fileService.readFile(filePath)).rejects.toThrow('ENOENT');
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      // Given
      const filePath = '/test/file.md';
      mockFs.access.mockResolvedValue(undefined);

      // When
      const exists = await fileService.fileExists(filePath);

      // Then
      expect(exists).toBe(true);
      expect(mockFs.access).toHaveBeenCalledWith(filePath);
    });

    it('should return false when file does not exist', async () => {
      // Given
      const filePath = '/test/nonexistent.md';
      mockFs.access.mockRejectedValue(new Error('ENOENT'));

      // When
      const exists = await fileService.fileExists(filePath);

      // Then
      expect(exists).toBe(false);
    });
  });

  describe('isMarkdownFile', () => {
    it('should return true for .md files', () => {
      // Given
      const filePath = '/test/file.md';

      // When
      const isMarkdown = fileService.isMarkdownFile(filePath);

      // Then
      expect(isMarkdown).toBe(true);
    });

    it('should return true for .MD files (case insensitive)', () => {
      // Given
      const filePath = '/test/file.MD';

      // When
      const isMarkdown = fileService.isMarkdownFile(filePath);

      // Then
      expect(isMarkdown).toBe(true);
    });

    it('should return false for non-markdown files', () => {
      // Given
      const filePath = '/test/file.txt';

      // When
      const isMarkdown = fileService.isMarkdownFile(filePath);

      // Then
      expect(isMarkdown).toBe(false);
    });
  });

  describe('isHtmlFile', () => {
    it('should return true for .html files', () => {
      // Given
      const filePath = '/test/file.html';

      // When
      const isHtml = fileService.isHtmlFile(filePath);

      // Then
      expect(isHtml).toBe(true);
    });

    it('should return true for .htm files', () => {
      // Given
      const filePath = '/test/file.htm';

      // When
      const isHtml = fileService.isHtmlFile(filePath);

      // Then
      expect(isHtml).toBe(true);
    });

    it('should return false for non-html files', () => {
      // Given
      const filePath = '/test/file.txt';

      // When
      const isHtml = fileService.isHtmlFile(filePath);

      // Then
      expect(isHtml).toBe(false);
    });
  });
});