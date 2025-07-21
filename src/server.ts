#!/usr/bin/env node

import express from 'express';
import * as path from 'path';
import { AppFactory } from './factories/AppFactory';

const app = express();
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
const excludePatterns: RegExp[] = [];
const excludeIndex = args.findIndex(arg => arg === '--exclude' || arg === '-e');
if (excludeIndex !== -1 && args[excludeIndex + 1]) {
  const patterns = args[excludeIndex + 1].split(',');
  patterns.forEach(pattern => {
    try {
      excludePatterns.push(new RegExp(pattern));
    } catch (e) {
      console.error(`⚠️  Invalid regex pattern: ${pattern}`);
    }
  });
}

console.log(`📁 Target directory: ${targetDir}`);
console.log(`🔄 Recursive: ${recursive}`);
console.log(`🚫 Exclude patterns: ${excludePatterns.map(p => p.source).join(', ')}`);

// 静的ファイル（画像など）の配信
app.use(express.static(targetDir));

// ServerControllerの作成
const controller = AppFactory.createServerController(targetDir, excludePatterns);

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