import { IFileService } from '../interfaces/IFileService';
export declare class FileService implements IFileService {
    readFile(filePath: string): Promise<string>;
    fileExists(filePath: string): Promise<boolean>;
    isMarkdownFile(filePath: string): boolean;
    isHtmlFile(filePath: string): boolean;
}
//# sourceMappingURL=FileService.d.ts.map