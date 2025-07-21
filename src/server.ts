#!/usr/bin/env node

import express from 'express';
import * as path from 'path';
import { AppFactory } from './presentation/factories/AppFactory';
import { CliParser } from './application/services/CliParser';

const app = express();
const PORT = 15559;

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
  console.log(`\n🐾 Pika is running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📁 Target directory: ${options.targetDir}`);
  console.log(`🔄 Recursive: ${options.recursive}`);
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