"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppFactory = void 0;
const ServerController_1 = require("../controllers/ServerController");
const FileService_1 = require("../services/FileService");
const PathResolver_1 = require("../services/PathResolver");
const DirectoryTreeBuilder_1 = require("../services/DirectoryTreeBuilder");
const MarkdownRenderer_1 = require("../renderers/MarkdownRenderer");
const MarpRenderer_1 = require("../renderers/MarpRenderer");
class AppFactory {
    static createServerController(baseDir, excludePatterns = []) {
        const fileService = this.createFileService();
        const pathResolver = this.createPathResolver(baseDir, excludePatterns);
        const treeBuilder = this.createDirectoryTreeBuilder(fileService, pathResolver);
        const markdownRenderer = this.createMarkdownRenderer();
        const marpRenderer = this.createMarpRenderer();
        return new ServerController_1.ServerController(fileService, pathResolver, treeBuilder, markdownRenderer, marpRenderer, baseDir);
    }
    static createFileService() {
        return new FileService_1.FileService();
    }
    static createPathResolver(baseDir, excludePatterns = []) {
        return new PathResolver_1.PathResolver(baseDir, excludePatterns);
    }
    static createDirectoryTreeBuilder(fileService, pathResolver) {
        return new DirectoryTreeBuilder_1.DirectoryTreeBuilder(fileService, pathResolver);
    }
    static createMarkdownRenderer() {
        return new MarkdownRenderer_1.MarkdownRenderer();
    }
    static createMarpRenderer() {
        return new MarpRenderer_1.MarpRenderer();
    }
}
exports.AppFactory = AppFactory;
//# sourceMappingURL=AppFactory.js.map