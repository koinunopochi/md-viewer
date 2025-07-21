import { IFileService } from '../interfaces/IFileService';
import { IPathResolver } from '../interfaces/IPathResolver';
import { IDirectoryTreeBuilder } from '../interfaces/IDirectoryTreeBuilder';
import { IMarkdownRenderer } from '../interfaces/IMarkdownRenderer';
import { IMarpRenderer } from '../interfaces/IMarpRenderer';
import { IServerController } from '../interfaces/IServerController';
export declare class AppFactory {
    static createServerController(baseDir: string, excludePatterns?: RegExp[]): IServerController;
    static createFileService(): IFileService;
    static createPathResolver(baseDir: string, excludePatterns?: RegExp[]): IPathResolver;
    static createDirectoryTreeBuilder(fileService: IFileService, pathResolver: IPathResolver): IDirectoryTreeBuilder;
    static createMarkdownRenderer(): IMarkdownRenderer;
    static createMarpRenderer(): IMarpRenderer;
}
//# sourceMappingURL=AppFactory.d.ts.map