import { Request, Response } from 'express';
import { IFileService } from '../interfaces/IFileService';
import { IPathResolver } from '../interfaces/IPathResolver';
import { IDirectoryTreeBuilder } from '../interfaces/IDirectoryTreeBuilder';
import { IMarkdownRenderer } from '../interfaces/IMarkdownRenderer';
import { IMarpRenderer } from '../interfaces/IMarpRenderer';
import { IServerController } from '../interfaces/IServerController';
export declare class ServerController implements IServerController {
    private fileService;
    private pathResolver;
    private treeBuilder;
    private markdownRenderer;
    private marpRenderer;
    private baseDir;
    constructor(fileService: IFileService, pathResolver: IPathResolver, treeBuilder: IDirectoryTreeBuilder, markdownRenderer: IMarkdownRenderer, marpRenderer: IMarpRenderer, baseDir: string);
    handleIndex(req: Request, res: Response, recursive: boolean): Promise<void>;
    handleViewFile(req: Request, res: Response): Promise<void>;
    handleRawHtml(req: Request, res: Response): Promise<void>;
    private renderFileList;
    private renderTreeNode;
    private wrapInTemplate;
    private wrapHtmlFile;
}
//# sourceMappingURL=ServerController.d.ts.map