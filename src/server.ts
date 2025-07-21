#!/usr/bin/env node

import express from 'express';
import * as path from 'path';
import { AppFactory } from './presentation/factories/AppFactory';
import { CliParser } from './application/services/CliParser';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 15559;

// コマンドライン引数の解析
const cliParser = new CliParser();
const options = cliParser.parse(process.argv);

console.log(`📁 Target directory: ${options.targetDir}`);
console.log(`🔄 Recursive: ${options.recursive}`);
const customPatterns = options.excludePatterns.filter(p => 
  !['node_modules', '\\.git', '\\.next', 'dist', 'build', 'coverage', '\\.cache', '\\.vscode', '\\.idea'].includes(p.source)
);
if (customPatterns.length > 0) {
  console.log(`🚫 Custom exclude patterns: ${customPatterns.map(p => p.source).join(', ')}`);
}

// 静的ファイル（画像など）の配信
app.use(express.static(options.targetDir));

// ServerControllerの作成
const controller = AppFactory.createServerController(options.targetDir, options.excludePatterns);

// ルートパス - ファイル一覧
app.get('/', async (req, res) => {
  await controller.handleIndex(req, res, options.recursive);
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
  console.log(`
🐾 Pika is running!

📍 URL: http://localhost:${PORT}
📁 Directory: ${options.targetDir}
🔄 Mode: ${options.recursive ? 'Recursive' : 'Current directory only'}

✨ Features:
  • Markdown rendering with GitHub style
  • Mermaid diagrams without iframes
  • Marp presentations with navigation
  • HTML files with smart embedding
  • Chat format support

💡 Tips:
  • Use -h or --help for usage information
  • Use -r for recursive directory browsing
  • Custom port: PORT=3000 pika .

⏹  Stop: Press Ctrl+C
  `.trim());
});