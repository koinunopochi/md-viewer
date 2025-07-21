#!/usr/bin/env node
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
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const AppFactory_1 = require("./factories/AppFactory");
const app = (0, express_1.default)();
const PORT = 15559;
// コマンドライン引数の解析
const args = process.argv.slice(2);
// ディレクトリパスの処理
let targetDir = process.cwd();
for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('-')) {
        targetDir = path.resolve(args[i]);
        break;
    }
}
// オプションの処理
const recursive = args.includes('--recursive') || args.includes('-r');
// 除外パターンの処理
const excludePatterns = [];
const excludeIndex = args.findIndex(arg => arg === '--exclude' || arg === '-e');
if (excludeIndex !== -1 && args[excludeIndex + 1]) {
    const patterns = args[excludeIndex + 1].split(',');
    patterns.forEach(pattern => {
        try {
            excludePatterns.push(new RegExp(pattern));
        }
        catch (e) {
            console.error(`⚠️  Invalid regex pattern: ${pattern}`);
        }
    });
}
console.log(`📁 Target directory: ${targetDir}`);
console.log(`🔄 Recursive: ${recursive}`);
console.log(`🚫 Exclude patterns: ${excludePatterns.map(p => p.source).join(', ')}`);
// 静的ファイル（画像など）の配信
app.use(express_1.default.static(targetDir));
// ServerControllerの作成
const controller = AppFactory_1.AppFactory.createServerController(targetDir, excludePatterns);
// ルートパス - ファイル一覧
app.get('/', async (req, res) => {
    await controller.handleIndex(req, res, recursive);
});
// ファイル表示
app.get('/view/:filename(*)', async (req, res) => {
    await controller.handleViewFile(req, res);
});
// HTMLファイルを直接提供
app.get('/raw/:filename(*)', async (req, res) => {
    await controller.handleRawHtml(req, res);
});
// サーバー起動
app.listen(PORT, () => {
    console.log(`\n🐾 Pika is running!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📁 Target directory: ${targetDir}`);
    console.log(`🔄 Recursive: ${recursive}`);
    console.log(`\n📝 Usage:`);
    console.log(`1. Open http://localhost:${PORT} in your browser`);
    console.log(`2. Click on any Markdown/HTML file to view`);
    console.log(`\n💡 Examples:`);
    console.log(`   pika /path/to/directory`);
    console.log(`   pika /path/to/directory --recursive`);
    console.log(`   pika /path/to/directory --recursive --exclude "test.*,__tests__"`);
    console.log(`   pika . --recursive  # Recursively browse current directory`);
    console.log(`\n✅ Supports Markdown and HTML files`);
    console.log(`✅ Direct Mermaid diagram rendering`);
    console.log(`✅ Collapsible iframe UI`);
    console.log(`\n⏹  Stop: Ctrl+C`);
});
//# sourceMappingURL=server.js.map