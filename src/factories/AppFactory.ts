import { ServerController } from '../controllers/ServerController';
import { FileService } from '../services/FileService';
import { PathResolver } from '../services/PathResolver';
import { DirectoryTreeBuilder } from '../services/DirectoryTreeBuilder';
import { MarkdownRenderer } from '../renderers/MarkdownRenderer';
import { MarpRenderer } from '../renderers/MarpRenderer';
import { IFileService } from '../interfaces/IFileService';
import { IPathResolver } from '../interfaces/IPathResolver';
import { IDirectoryTreeBuilder } from '../interfaces/IDirectoryTreeBuilder';
import { IMarkdownRenderer } from '../interfaces/IMarkdownRenderer';
import { IMarpRenderer } from '../interfaces/IMarpRenderer';
import { IServerController } from '../interfaces/IServerController';

export class AppFactory {
  static createServerController(baseDir: string, excludePatterns: RegExp[] = []): IServerController {
    const fileService = this.createFileService();
    const pathResolver = this.createPathResolver(baseDir, excludePatterns);
    const treeBuilder = this.createDirectoryTreeBuilder(fileService, pathResolver);
    const markdownRenderer = this.createMarkdownRenderer();
    const marpRenderer = this.createMarpRenderer();

    return new ServerController(
      fileService,
      pathResolver,
      treeBuilder,
      markdownRenderer,
      marpRenderer,
      baseDir
    );
  }

  static createFileService(): IFileService {
    return new FileService();
  }

  static createPathResolver(baseDir: string, excludePatterns: RegExp[] = []): IPathResolver {
    return new PathResolver(baseDir, excludePatterns);
  }

  static createDirectoryTreeBuilder(
    fileService: IFileService,
    pathResolver: IPathResolver
  ): IDirectoryTreeBuilder {
    return new DirectoryTreeBuilder(fileService, pathResolver);
  }

  static createMarkdownRenderer(): IMarkdownRenderer {
    return new MarkdownRenderer();
  }

  static createMarpRenderer(): IMarpRenderer {
    return new MarpRenderer();
  }
}