import { AppFactory } from '../../presentation/factories/AppFactory';
import { ServerController } from '../../presentation/controllers/ServerController';
import { FileService } from '../../infrastructure/file-system/FileService';
import { PathResolver } from '../../infrastructure/file-system/PathResolver';
import { DirectoryTreeBuilder } from '../../infrastructure/file-system/DirectoryTreeBuilder';
import { MarkdownRenderer } from '../../infrastructure/renderers/MarkdownRenderer';
import { MarpRenderer } from '../../infrastructure/renderers/MarpRenderer';

describe('AppFactory', () => {
  describe('createServerController', () => {
    it('should create a ServerController with all dependencies', () => {
      // Given
      const baseDir = '/test/directory';
      const excludePatterns = [/test\.md$/];

      // When
      const controller = AppFactory.createServerController(baseDir, excludePatterns);

      // Then
      expect(controller).toBeInstanceOf(ServerController);
      expect(controller).toBeDefined();
    });

    it('should create a ServerController with default exclude patterns', () => {
      // Given
      const baseDir = '/test/directory';

      // When
      const controller = AppFactory.createServerController(baseDir);

      // Then
      expect(controller).toBeInstanceOf(ServerController);
    });
  });

  describe('createFileService', () => {
    it('should create a FileService instance', () => {
      // When
      const fileService = AppFactory.createFileService();

      // Then
      expect(fileService).toBeInstanceOf(FileService);
    });
  });

  describe('createPathResolver', () => {
    it('should create a PathResolver with custom exclude patterns', () => {
      // Given
      const baseDir = '/test';
      const excludePatterns = [/\.spec\.ts$/];

      // When
      const pathResolver = AppFactory.createPathResolver(baseDir, excludePatterns);

      // Then
      expect(pathResolver).toBeInstanceOf(PathResolver);
      expect(pathResolver.isExcluded('file.spec.ts')).toBe(true);
    });
  });

  describe('createDirectoryTreeBuilder', () => {
    it('should create a DirectoryTreeBuilder with dependencies', () => {
      // Given
      const fileService = AppFactory.createFileService();
      const pathResolver = AppFactory.createPathResolver('/test');

      // When
      const treeBuilder = AppFactory.createDirectoryTreeBuilder(fileService, pathResolver);

      // Then
      expect(treeBuilder).toBeInstanceOf(DirectoryTreeBuilder);
    });
  });

  describe('createMarkdownRenderer', () => {
    it('should create a MarkdownRenderer instance', () => {
      // When
      const renderer = AppFactory.createMarkdownRenderer();

      // Then
      expect(renderer).toBeInstanceOf(MarkdownRenderer);
    });
  });

  describe('createMarpRenderer', () => {
    it('should create a MarpRenderer instance', () => {
      // When
      const renderer = AppFactory.createMarpRenderer();

      // Then
      expect(renderer).toBeInstanceOf(MarpRenderer);
    });
  });
});