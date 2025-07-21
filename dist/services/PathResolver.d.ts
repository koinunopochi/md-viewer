import { IPathResolver } from '../interfaces/IPathResolver';
export declare class PathResolver implements IPathResolver {
    private baseDir;
    private excludePatterns;
    private defaultExcludePatterns;
    constructor(baseDir: string, customExcludePatterns?: RegExp[]);
    resolvePath(filePath: string): string;
    isPathSafe(filePath: string): boolean;
    getRelativePath(absolutePath: string): string;
    isExcluded(filePath: string): boolean;
}
//# sourceMappingURL=PathResolver.d.ts.map