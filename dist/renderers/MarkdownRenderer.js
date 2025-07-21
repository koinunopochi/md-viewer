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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownRenderer = void 0;
const zenn_markdown_html_1 = __importDefault(require("zenn-markdown-html"));
const yaml = __importStar(require("js-yaml"));
const path = __importStar(require("path"));
class MarkdownRenderer {
    render(markdown) {
        return (0, zenn_markdown_html_1.default)(markdown);
    }
    isMarpDocument(markdown) {
        const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
        if (!frontMatterMatch)
            return false;
        try {
            const frontMatter = yaml.load(frontMatterMatch[1]);
            return frontMatter.marp === true;
        }
        catch (e) {
            return false;
        }
    }
    processImages(markdown, baseUrl) {
        // Process Markdown image syntax ![alt](src)
        let processed = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
            if (src.startsWith('http') || src.startsWith('//')) {
                return match;
            }
            const resolvedPath = path.join(baseUrl, src).replace(/\\/g, '/');
            return `![${alt}](${resolvedPath})`;
        });
        // Process HTML img tags
        processed = processed.replace(/<img\s+([^>]*src=")([^"]+)"([^>]*)>/g, (match, prefix, src, suffix) => {
            if (src.startsWith('http') || src.startsWith('//')) {
                return match;
            }
            const resolvedPath = path.join(baseUrl, src).replace(/\\/g, '/');
            return `<img ${prefix}${resolvedPath}"${suffix}>`;
        });
        return processed;
    }
}
exports.MarkdownRenderer = MarkdownRenderer;
//# sourceMappingURL=MarkdownRenderer.js.map