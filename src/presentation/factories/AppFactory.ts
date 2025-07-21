import { ServerController } from '../controllers/ServerController';
import { FileService } from '../../infrastructure/file-system/FileService';
import { PathResolver } from '../../infrastructure/file-system/PathResolver';
import { DirectoryTreeBuilder } from '../../infrastructure/file-system/DirectoryTreeBuilder';
import { MarkdownRenderer } from '../../infrastructure/renderers/MarkdownRenderer';
import { MarpRenderer } from '../../infrastructure/renderers/MarpRenderer';
import { CsvRenderer } from '../../infrastructure/renderers/CsvRenderer';
import { IFileService } from '../../domain/interfaces/IFileService';
import { IPathResolver } from '../../domain/interfaces/IPathResolver';
import { IDirectoryTreeBuilder } from '../../domain/interfaces/IDirectoryTreeBuilder';
import { IMarkdownRenderer } from '../../domain/interfaces/IMarkdownRenderer';
import { IMarpRenderer } from '../../domain/interfaces/IMarpRenderer';
import { ICsvRenderer } from '../../domain/interfaces/ICsvRenderer';
import { IServerController } from '../controllers/IServerController';

export class AppFactory {
  static createServerController(baseDir: string, excludePatterns: RegExp[] = []): IServerController {
    const fileService = this.createFileService();
    const pathResolver = this.createPathResolver(baseDir, excludePatterns);
    const treeBuilder = this.createDirectoryTreeBuilder(fileService, pathResolver);
    const markdownRenderer = this.createMarkdownRenderer();
    const marpRenderer = this.createMarpRenderer();
    const csvRenderer = this.createCsvRenderer();

    return new ServerController(
      fileService,
      pathResolver,
      treeBuilder,
      markdownRenderer,
      marpRenderer,
      csvRenderer,
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

  static createCsvRenderer(): ICsvRenderer {
    return new CsvRenderer();
  }
}