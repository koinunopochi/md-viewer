"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathResolver = void 0;
const path = __importStar(require("path"));
class PathResolver {
    constructor(baseDir, customExcludePatterns = []) {
        this.defaultExcludePatterns = [
            /node_modules/,
            /\.git/,
            /\.next/,
            /dist/,
            /build/,
            /coverage/,
            /\.cache/,
            /\.vscode/,
            /\.idea/
        ];
        this.baseDir = path.resolve(baseDir);
        this.excludePatterns = [...this.defaultExcludePatterns, ...customExcludePatterns];
    }
    resolvePath(filePath) {
        if (path.isAbsolute(filePath)) {
            return path.normalize(filePath);
        }
        return path.resolve(this.baseDir, filePath);
    }
    isPathSafe(filePath) {
        const resolvedPath = this.resolvePath(filePath);
        const normalizedPath = path.normalize(resolvedPath);
        return normalizedPath.startsWith(this.baseDir);
    }
    getRelativePath(absolutePath) {
        return path.relative(this.baseDir, absolutePath);
    }
    isExcluded(filePath) {
        return this.excludePatterns.some(pattern => pattern.test(filePath));
    }
}
exports.PathResolver = PathResolver;
//# sourceMappingURL=PathResolver.js.map