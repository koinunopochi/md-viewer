#!/usr/bin/env node

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const markdownToHtml = require('zenn-markdown-html').default;
const { Marp } = require('@marp-team/marp-core');
const yaml = require('js-yaml');

const app = express();
const PORT = 15559;

// コマンドライン引数からディレクトリパスを取得
const args = process.argv.slice(2);
// ディレクトリパスの処理
let targetDir = process.cwd();
for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('-')) {
        targetDir = path.resolve(args[i]);
        break;
    }
}
const recursive = args.includes('--recursive') || args.includes('-r');

// 除外パターンの処理
const excludePatterns = [];
const excludeIndex = args.findIndex(arg => arg === '--exclude' || arg === '-e');
if (excludeIndex !== -1 && args[excludeIndex + 1]) {
    const patterns = args[excludeIndex + 1].split(',');
    patterns.forEach(pattern => {
        try {
            excludePatterns.push(new RegExp(pattern));
        } catch (e) {
            console.error(`⚠️  無効な正規表現: ${pattern}`);
        }
    });
}

// デフォルトの除外パターン
const defaultExcludePatterns = [
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

// 除外パターンをマージ
const allExcludePatterns = [...defaultExcludePatterns, ...excludePatterns];

console.log(`📁 Target directory: ${targetDir}`);
console.log(`🔄 Recursive: ${recursive}`);
console.log(`🚫 Exclude patterns: ${allExcludePatterns.map(p => p.source).join(', ')}`);

// 静的ファイル（画像など）の配信
app.use(express.static(targetDir));

// HTMLテンプレート
const htmlTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Pika</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 100%;
            padding: 45px;
        }
        .file-list {
            background: #f6f8fa;
            border: 1px solid #d1d9e0;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .file-list h2 {
            margin-top: 0;
        }
        .file-list ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .tree-root {
            padding-left: 0 !important;
        }
        .file-list li {
            padding: 3px 0;
            line-height: 1.5;
        }
        .file-list li.directory {
            font-weight: 500;
        }
        .file-list .file-sublist {
            margin: 0;
            padding-left: 0;
            display: none;
        }
        .file-list .file-sublist.expanded {
            display: block;
        }
        .file-list li.file {
            font-weight: normal;
        }
        .file-list a {
            text-decoration: none;
            color: #0969da;
        }
        .file-list a:hover {
            text-decoration: underline;
        }
        .directory-header {
            cursor: pointer;
            user-select: none;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 2px 5px;
            border-radius: 4px;
            width: auto;
        }
        .directory-header:hover {
            background: #f0f0f0;
        }
        .directory-toggle {
            display: inline-block;
            width: 12px;
            transition: transform 0.2s;
            flex-shrink: 0;
        }
        .directory-toggle.expanded {
            transform: rotate(90deg);
        }
        .file-count {
            color: #666;
            font-size: 0.9em;
            font-weight: normal;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #0969da;
            text-decoration: none;
        }
        .back-link:hover {
            text-decoration: underline;
        }
        /* Mermaid直接表示用スタイル */
        .mermaid-wrapper {
            margin: 20px 0;
            padding: 20px;
            background: #f6f8fa;
            border: 1px solid #d1d9e0;
            border-radius: 6px;
            overflow-x: auto;
            overflow-y: visible;
        }
        .mermaid {
            display: block;
            margin: 0 auto;
        }
        .mermaid svg {
            max-width: none !important;
            height: auto !important;
        }
        /* iframe折りたたみ用スタイル */
        .iframe-container {
            margin: 20px 0;
            border: 1px solid #d1d9e0;
            border-radius: 6px;
            overflow: hidden;
        }
        .iframe-header {
            background: #f6f8fa;
            padding: 10px 15px;
            padding-right: 150px; /* リンク用のスペースを確保 */
            cursor: pointer;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid #d1d9e0;
            position: relative;
            min-height: 40px;
        }
        .iframe-header:hover {
            background: #ebeef1;
        }
        .iframe-toggle {
            display: inline-block;
            width: 12px;
            transition: transform 0.2s;
        }
        .iframe-toggle.expanded {
            transform: rotate(90deg);
        }
        .iframe-title {
            flex: 1;
            font-weight: 500;
            color: #333;
        }
        .iframe-badge {
            background: #0969da;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-right: 10px;
        }
        .iframe-link {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            text-decoration: none;
            color: #0969da;
            font-size: 14px;
            padding: 4px 12px;
            border-radius: 4px;
            transition: background 0.2s;
            white-space: nowrap;
            z-index: 1;
        }
        .iframe-link:hover {
            background: rgba(9, 105, 218, 0.1);
            text-decoration: underline;
        }
        .iframe-content {
            height: 0;
            overflow: hidden;
            transition: height 0.3s ease;
        }
        .iframe-content.expanded {
            height: 800px;
        }
        .iframe-content iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        /* チャットUI用スタイル */
        .chat-container {
            background: #f5f5f5;
            border-radius: 8px;
            margin: 20px 0;
            padding: 20px;
            max-width: 800px;
        }
        .chat-header {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
            padding: 10px;
            background: #e9ecef;
            border-radius: 6px;
        }
        .chat-message {
            display: flex;
            margin-bottom: 15px;
            align-items: flex-start;
        }
        .chat-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
        }
        .chat-message-content {
            flex: 1;
            max-width: 70%;
        }
        .chat-message-header {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
        }
        .chat-username {
            font-weight: bold;
            color: #333;
            margin-right: 8px;
            font-size: 14px;
        }
        .chat-time {
            color: #999;
            font-size: 12px;
        }
        .chat-bubble {
            background: white;
            border-radius: 18px;
            padding: 12px 16px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            position: relative;
            word-wrap: break-word;
        }
        .chat-bubble::before {
            content: '';
            position: absolute;
            top: 8px;
            left: -8px;
            width: 0;
            height: 0;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-right: 8px solid white;
        }
        .chat-emotion {
            margin-top: 6px;
            font-size: 11px;
            color: #888;
            font-style: italic;
        }
        .chat-tags {
            margin-top: 4px;
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        .chat-tag {
            background: #e3f2fd;
            color: #1976d2;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
        }
        .chat-parent { background: #e8f5e8; }
        .chat-teacher { background: #fff3e0; }
        .chat-admin { background: #f3e5f5; }
    </style>
    <script>
        // Mermaid初期化
        mermaid.initialize({ 
            startOnLoad: false,
            theme: 'default',
            themeVariables: {
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis',
                diagramPadding: 8,
                rankdir: 'TB'
            },
            sequence: {
                useMaxWidth: true,
                diagramMarginX: 50,
                diagramMarginY: 10
            },
            er: {
                useMaxWidth: true,
                entityPadding: 15,
                fontSize: 12,
                minEntityWidth: 100,
                minEntityHeight: 75
            }
        });
        
        // ページ読み込み後にMermaidを実行
        document.addEventListener('DOMContentLoaded', async function() {
            const mermaidElements = document.querySelectorAll('.mermaid');
            console.log('Found mermaid elements:', mermaidElements.length);
            
            if (mermaidElements.length > 0) {
                await mermaid.run({
                    querySelector: '.mermaid'
                });
            }
        });
    </script>
</head>
<body>
    ${content}
</body>
</html>
`;

// Marpインスタンスの作成
const marp = new Marp({
    html: true,
    inlineSVG: false  // SVGではなくHTMLでレンダリング
});

// YAMLフロントマターを解析してMarp記法かどうか判定
function isMarpDocument(markdown) {
    const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) return false;
    
    try {
        const frontMatter = yaml.load(frontMatterMatch[1]);
        return frontMatter.marp === true;
    } catch (e) {
        return false;
    }
}

// チャット形式変換関数
function convertChatToHTML(chatId, content) {
    // CHAT-DATA-BEGINからCHAT-DATA-ENDまでのデータを抽出
    const chatDataMatch = content.match(/\[CHAT-DATA-BEGIN\]([\s\S]*?)\[CHAT-DATA-END\]/);
    if (!chatDataMatch) return null;
    
    const chatData = chatDataMatch[1].trim();
    const messages = [];
    
    // メッセージを分割（---で区切られている）
    const messageParts = chatData.split(/\n---\n/);
    
    messageParts.forEach(part => {
        const lines = part.trim().split('\n');
        if (lines.length < 2) return;
        
        // 最初の行からユーザー情報を抽出
        const userMatch = lines[0].match(/^(👤|👩‍💼|👩‍🏫)\s+(.+?)\s+(\d{2}:\d{2})$/);
        if (!userMatch) return;
        
        const [, emoji, username, time] = userMatch;
        const messageText = lines[1] || '';
        
        // メタデータを抽出
        let emotion = '';
        let tags = [];
        
        for (let i = 2; i < lines.length; i++) {
            const emotionMatch = lines[i].match(/\[emotion: ([^\]]+)\]/);
            const tagsMatch = lines[i].match(/\[tags: ([^\]]+)\]/);
            
            if (emotionMatch) emotion = emotionMatch[1];
            if (tagsMatch) tags = tagsMatch[1].split(',').map(t => t.trim());
        }
        
        // ユーザータイプを判定
        let userType = 'parent';
        if (username.includes('主任') || username.includes('保育士') || emoji === '👩‍🏫') userType = 'teacher';
        if (username.includes('主任') || emoji === '👩‍💼') userType = 'admin';
        
        messages.push({
            emoji,
            username,
            time,
            message: messageText,
            emotion,
            tags,
            userType
        });
    });
    
    // HTMLを生成
    let chatHtml = `<div class="chat-container">`;
    chatHtml += `<div class="chat-header">💬 会話形式: ${chatId}</div>`;
    
    messages.forEach(msg => {
        chatHtml += `
        <div class="chat-message">
            <div class="chat-avatar chat-${msg.userType}">${msg.emoji}</div>
            <div class="chat-message-content">
                <div class="chat-message-header">
                    <span class="chat-username">${msg.username}</span>
                    <span class="chat-time">${msg.time}</span>
                </div>
                <div class="chat-bubble">
                    ${msg.message}
                    ${msg.emotion ? `<div class="chat-emotion">😭 ${msg.emotion}</div>` : ''}
                    ${msg.tags.length > 0 ? `<div class="chat-tags">${msg.tags.map(tag => `<span class="chat-tag">#${tag}</span>`).join('')}</div>` : ''}
                </div>
            </div>
        </div>`;
    });
    
    chatHtml += `</div>`;
    
    return chatHtml;
}

// ツリー構造を構築
class TreeNode {
    constructor(name, type = 'directory', relativePath = '') {
        this.name = name;
        this.type = type; // 'directory' or 'file'
        this.relativePath = relativePath;
        this.children = [];
    }
    
    addChild(child) {
        this.children.push(child);
    }
    
    getFileCount() {
        if (this.type === 'file') return 1;
        return this.children.reduce((count, child) => count + child.getFileCount(), 0);
    }
}

// 再帰的にディレクトリツリーを構築
async function buildFileTree(dir, baseDir = dir, parentNode = null) {
    const relativePath = path.relative(baseDir, dir);
    
    // 除外パターンにマッチするかチェック
    if (relativePath && allExcludePatterns.some(pattern => pattern.test(relativePath))) {
        return parentNode;
    }
    
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const currentNode = parentNode || new TreeNode(path.basename(dir), 'directory', relativePath);
        
        // まずディレクトリを処理
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const fileRelativePath = path.relative(baseDir, fullPath);
            
            // 除外パターンにマッチするかチェック
            if (allExcludePatterns.some(pattern => pattern.test(fileRelativePath))) {
                continue;
            }
            
            if (entry.isDirectory() && recursive) {
                const dirNode = new TreeNode(entry.name, 'directory', fileRelativePath);
                currentNode.addChild(dirNode);
                await buildFileTree(fullPath, baseDir, dirNode);
            }
        }
        
        // 次にファイルを処理
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const fileRelativePath = path.relative(baseDir, fullPath);
            
            if (allExcludePatterns.some(pattern => pattern.test(fileRelativePath))) {
                continue;
            }
            
            if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.html') || entry.name.endsWith('.htm'))) {
                const fileNode = new TreeNode(entry.name, 'file', fileRelativePath);
                currentNode.addChild(fileNode);
            }
        }
        
        return currentNode;
    } catch (error) {
        console.error(`⚠️  ディレクトリ読み取りエラー: ${dir}`, error.message);
        return parentNode || new TreeNode(path.basename(dir), 'directory', relativePath);
    }
}

// ルートパス - ファイル一覧
app.get('/', async (req, res) => {
    try {
        let treeRoot;
        
        if (recursive) {
            treeRoot = await buildFileTree(targetDir);
        } else {
            // 非再帰モードではルートディレクトリのみ表示
            treeRoot = new TreeNode(path.basename(targetDir), 'directory', '');
            const files = await fs.readdir(targetDir, { withFileTypes: true });
            
            for (const file of files) {
                if (file.isFile() && (file.name.endsWith('.md') || file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
                    const fileNode = new TreeNode(file.name, 'file', file.name);
                    treeRoot.addChild(fileNode);
                }
            }
        }
        
        // ツリー構造をHTMLに変換
        const renderTreeNode = (node, depth = 0) => {
            let html = '';
            
            if (node.type === 'directory' && (depth > 0 || node.children.length > 0)) {
                const fileCount = node.getFileCount();
                const dirId = `dir-${node.relativePath.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const hasChildren = node.children.length > 0;
                
                if (depth > 0) {
                    html += `<li class="directory">
                        <div class="directory-header" ${hasChildren ? `onclick="toggleDirectory('${dirId}')"`  : ''} style="padding-left: ${depth * 20}px">
                            ${hasChildren ? `<span class="directory-toggle" id="toggle-${dirId}">▶</span>` : '<span style="width: 12px; display: inline-block;"></span>'}
                            <span>📁 ${node.name}</span>
                            ${fileCount > 0 ? `<span class="file-count">(${fileCount})</span>` : ''}
                        </div>`;
                    
                    if (hasChildren) {
                        html += `<ul class="file-sublist" id="${dirId}">`;
                    }
                }
                
                // 子要素をレンダリング
                node.children.forEach(child => {
                    html += renderTreeNode(child, depth + 1);
                });
                
                if (depth > 0 && hasChildren) {
                    html += '</ul>';
                }
                if (depth > 0) {
                    html += '</li>';
                }
            } else if (node.type === 'file') {
                const icon = node.name.endsWith('.md') ? '📝' : '🌐';
                html += `<li class="file" style="padding-left: ${depth * 20}px">
                    <span style="width: 12px; display: inline-block;"></span>
                    ${icon} <a href="/view/${encodeURIComponent(node.relativePath)}">${node.name}</a>
                </li>`;
            }
            
            return html;
        };
        
        const fileList = `<ul class="tree-root">${renderTreeNode(treeRoot)}</ul>`;
        
        const content = `
            <div class="file-list">
                <h2>Document Files</h2>
                <p>📁 Directory: ${targetDir}</p>
                <p>✅ View Markdown and HTML files</p>
                <p>✅ Direct Mermaid rendering without iframes</p>
                ${recursive ? '<p>🔄 Recursive search: Enabled</p>' : ''}
                ${excludePatterns.length > 0 ? `<p>🚫 Custom exclude patterns: ${excludePatterns.map(p => p.source).join(', ')}</p>` : ''}
                <p>💡 Click directories to expand/collapse</p>
                ${fileList}
            </div>
            <script>
                // ディレクトリの折りたたみ機能
                function toggleDirectory(dirId) {
                    const sublist = document.getElementById(dirId);
                    const toggle = document.getElementById('toggle-' + dirId);
                    
                    if (sublist.classList.contains('expanded')) {
                        sublist.classList.remove('expanded');
                        toggle.classList.remove('expanded');
                        localStorage.setItem(dirId, 'collapsed');
                    } else {
                        sublist.classList.add('expanded');
                        toggle.classList.add('expanded');
                        localStorage.setItem(dirId, 'expanded');
                    }
                }
                
                // ページ読み込み時に保存された状態を復元
                document.addEventListener('DOMContentLoaded', function() {
                    const directories = document.querySelectorAll('.directory');
                    directories.forEach(dir => {
                        const sublist = dir.querySelector('.file-sublist');
                        if (sublist && sublist.id) {
                            const state = localStorage.getItem(sublist.id);
                            const toggle = document.getElementById('toggle-' + sublist.id);
                            if (state === 'expanded') {
                                sublist.classList.add('expanded');
                                toggle.classList.add('expanded');
                            }
                        }
                    });
                });
            </script>
        `;
        
        res.send(htmlTemplate('Pika Document Viewer', content));
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

// ファイル表示
app.get('/view/:filename(*)', async (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const filePath = path.join(targetDir, filename);
        
        // セキュリティチェック
        if (filename.includes('..')) {
            return res.status(400).send('Invalid file path');
        }
        
        // 画像ファイルの場合は静的ファイルとして配信
        if (filename.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
            return res.sendFile(filePath);
        }
        
        // HTMLファイルの場合
        if (filename.endsWith('.html') || filename.endsWith('.htm')) {
            // iframeからのリクエストかどうかをチェック
            const referer = req.get('referer');
            const isFromIframe = referer && referer.includes('/raw/');
            
            if (isFromIframe) {
                // iframe内からのナビゲーションの場合は、直接HTMLを返す
                return res.redirect(`/raw/${encodeURIComponent(filename)}`);
            }
            
            const content = `
                <a href="/" class="back-link">← Back to file list</a>
                <div style="border: 1px solid #d1d9e0; border-radius: 6px; margin: 20px 0;">
                    <iframe 
                        id="content-frame"
                        src="/raw/${encodeURIComponent(filename)}" 
                        style="width: 100%; height: calc(100vh - 100px); border: none; border-radius: 6px;"
                        sandbox="allow-scripts allow-same-origin allow-top-navigation"
                    ></iframe>
                </div>
            `;
            return res.send(htmlTemplate(filename, content));
        }
        
        // Markdownファイル以外は拒否
        if (!filename.endsWith('.md')) {
            return res.status(400).send('Invalid file type');
        }
        
        const markdown = await fs.readFile(filePath, 'utf-8');
        
        // Marp記法かどうか判定
        if (isMarpDocument(markdown)) {
            // Marpスライドとして処理
            console.log('=== Marp Document Detected ===');
            console.log('Markdown length:', markdown.length);
            console.log('First 200 chars:', markdown.substring(0, 200));
            
            const { html, css } = marp.render(markdown);
            
            console.log('=== Marp Render Result ===');
            console.log('HTML length:', html.length);
            console.log('CSS length:', css.length);
            console.log('First 500 chars of HTML:', html.substring(0, 500));
            console.log('Number of sections:', (html.match(/<section/g) || []).length);
            
            // HTMLの構造を詳しく調査
            const hasWrapper = html.includes('class="marpit"');
            const hasSvg = html.includes('<svg');
            console.log('Has marpit wrapper:', hasWrapper);
            console.log('Has SVG elements:', hasSvg);
            
            // セクションの内容を確認
            const sectionMatches = html.match(/<section[^>]*>[\s\S]*?<\/section>/g);
            if (sectionMatches) {
                console.log('Section count:', sectionMatches.length);
                sectionMatches.forEach((section, i) => {
                    console.log(`Section ${i} preview:`, section.substring(0, 200));
                });
            }
            
            const slideContent = `
                <style>
                    body { margin: 0; overflow: hidden; }
                    .marp-container {
                        width: 100vw;
                        height: 100vh;
                        position: relative;
                        background: #f5f5f5;
                    }
                    .marp-slide-wrapper {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .marpit {
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    }
                    .slide-navigation {
                        position: fixed;
                        bottom: 30px;
                        left: 50%;
                        transform: translateX(-50%);
                        display: flex;
                        gap: 20px;
                        z-index: 1000;
                    }
                    .slide-navigation button {
                        padding: 10px 20px;
                        font-size: 16px;
                        cursor: pointer;
                        background: #333;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        transition: background 0.3s;
                    }
                    .slide-navigation button:hover:not(:disabled) {
                        background: #555;
                    }
                    .slide-navigation button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    .slide-counter {
                        color: #333;
                        font-size: 16px;
                        line-height: 40px;
                    }
                    .back-link {
                        position: fixed;
                        top: 20px;
                        left: 20px;
                        z-index: 1000;
                        background: rgba(255,255,255,0.9);
                        padding: 10px 15px;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    ${css}
                </style>
                <a href="/" class="back-link">← Back to file list</a>
                <div class="marp-container">
                    <div class="marp-slide-wrapper">
                        ${html}
                    </div>
                    <div class="slide-navigation">
                        <button id="prevSlide">← 前へ</button>
                        <span class="slide-counter">
                            <span id="currentSlide">1</span> / <span id="totalSlides">1</span>
                        </span>
                        <button id="nextSlide">次へ →</button>
                    </div>
                </div>
                <script>
                    // Marpの生成するHTMLに合わせてセレクタを調整
                    let slides = document.querySelectorAll('section');
                    if (slides.length === 0) {
                        // .marpit内のセクションを探す
                        slides = document.querySelectorAll('.marpit section');
                    }
                    if (slides.length === 0) {
                        // それでも見つからない場合は、SVG内の要素を探す
                        slides = document.querySelectorAll('.marpit > svg > foreignObject > section');
                    }
                    
                    console.log('Found slides:', slides.length);
                    console.log('Slides:', slides);
                    
                    let currentSlideIndex = 0;
                    const totalSlides = slides.length;
                    
                    console.log('=== Client-side Debug ===');
                    console.log('Found slides:', totalSlides);
                    console.log('Slides:', slides);
                    slides.forEach((slide, i) => {
                        console.log(\`Slide \${i}:\`, slide.innerHTML.substring(0, 100));
                    });
                    
                    document.getElementById('totalSlides').textContent = totalSlides;
                    
                    function showSlide(index) {
                        slides.forEach((slide, i) => {
                            slide.style.display = i === index ? 'block' : 'none';
                        });
                        document.getElementById('currentSlide').textContent = index + 1;
                        document.getElementById('prevSlide').disabled = index === 0;
                        document.getElementById('nextSlide').disabled = index === totalSlides - 1;
                    }
                    
                    document.getElementById('prevSlide').addEventListener('click', () => {
                        if (currentSlideIndex > 0) {
                            currentSlideIndex--;
                            showSlide(currentSlideIndex);
                        }
                    });
                    
                    document.getElementById('nextSlide').addEventListener('click', () => {
                        if (currentSlideIndex < totalSlides - 1) {
                            currentSlideIndex++;
                            showSlide(currentSlideIndex);
                        }
                    });
                    
                    // キーボードナビゲーション
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'ArrowLeft' && currentSlideIndex > 0) {
                            currentSlideIndex--;
                            showSlide(currentSlideIndex);
                        } else if (e.key === 'ArrowRight' && currentSlideIndex < totalSlides - 1) {
                            currentSlideIndex++;
                            showSlide(currentSlideIndex);
                        }
                    });
                    
                    // 初期表示
                    showSlide(0);
                </script>
            `;
            
            res.send(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename} - Marp Slides</title>
</head>
<body>
    ${slideContent}
</body>
</html>`);
        } else {
            // 通常のMarkdownとして処理
            let processedMarkdown = markdown;
            let iframeCounter = 0;
            
            // チャット形式を検出してプレースホルダに変換
            const chatReplacements = [];
            let chatIndex = 0;
            processedMarkdown = processedMarkdown.replace(
                /<!-- CHAT-CONVERSION-START: ([^>]+) -->([\s\S]*?)<!-- CHAT-CONVERSION-END -->/g,
                (match, chatId, content) => {
                    const chatHtml = convertChatToHTML(chatId, content);
                    if (chatHtml) {
                        const marker = `[[CHAT_MARKER_${chatIndex}]]`;
                        chatReplacements.push({ marker, html: chatHtml });
                        chatIndex++;
                        return marker;
                    }
                    return match;
                }
            );
            
            // iframeを生成するヘルパー関数
            const generateIframe = (src, title) => {
                iframeCounter++;
                const iframeId = `iframe-${Date.now()}-${iframeCounter}`;
                
                // 相対パスを解決
                let resolvedSrc = src;
                if (!src.startsWith('http') && !src.startsWith('/')) {
                    const mdDir = path.dirname(filename);
                    const resolvedPath = path.join(mdDir, src).replace(/\\/g, '/');
                    const normalizedPath = path.normalize(resolvedPath).replace(/\\/g, '/');
                    resolvedSrc = `/view/${encodeURIComponent(normalizedPath)}`;
                }
                
                // ファイル名を取得
                const fileName = path.basename(src);
                const displayTitle = title || fileName;
                
                return `
<div class="iframe-container" id="container-${iframeId}">
    <div class="iframe-header" onclick="toggleIframe(event, '${iframeId}')">
        <span class="iframe-toggle" id="toggle-${iframeId}">▶</span>
        <span class="iframe-title">🌐 ${displayTitle}</span>
        <span class="iframe-badge">HTML</span>
        <a href="${resolvedSrc}" class="iframe-link" onclick="event.stopPropagation()" target="_blank">元ファイルを開く ↗</a>
    </div>
    <div class="iframe-content" id="content-${iframeId}">
        <iframe src="${resolvedSrc}" loading="lazy" sandbox="allow-scripts allow-same-origin" style="width: 100%; height: 100%; border: none;"></iframe>
    </div>
</div>`;
            };
            
            // リンクとiframeの情報を保存
            const iframeReplacements = [];
            let iframeIndex = 0;
            
            // MDファイル内のHTMLリンクを一時的なマーカーに変換
            // [テキスト](path/to/file.html) 形式のリンクを検出
            processedMarkdown = processedMarkdown.replace(
                /\[([^\]]+)\]\(([^)]+\.(?:html|htm))\)/g,
                (match, text, htmlPath) => {
                    // 絶対パスや外部URLはスキップ
                    if (htmlPath.startsWith('http') || htmlPath.startsWith('//')) {
                        return match;
                    }
                    const marker = `[[IFRAME_MARKER_${iframeIndex}]]`;
                    iframeReplacements.push({ marker, html: generateIframe(htmlPath, text) });
                    iframeIndex++;
                    return marker;
                }
            );
            
            // 明示的なiframeタグも処理
            processedMarkdown = processedMarkdown.replace(
                /<iframe\s+([^>]*src=")([^"]+)"([^>]*)><\/iframe>/g,
                (match, prefix, iframeSrc, suffix) => {
                    // title属性を探す
                    const titleMatch = (prefix + suffix).match(/title="([^"]+)"/);
                    const title = titleMatch ? titleMatch[1] : null;
                    const marker = `[[IFRAME_MARKER_${iframeIndex}]]`;
                    iframeReplacements.push({ marker, html: generateIframe(iframeSrc, title) });
                    iframeIndex++;
                    return marker;
                }
            );
            
            // HTMLタグ内の画像パスも処理
            processedMarkdown = processedMarkdown.replace(
                /<img\s+([^>]*src=")([^"]+)"([^>]*)>/g,
                (match, prefix, imgPath, suffix) => {
                    // 絶対パスやHTTPパスはそのまま
                    if (imgPath.startsWith('http') || imgPath.startsWith('/')) {
                        return match;
                    }
                    
                    // 相対パスを解決
                    const mdDir = path.dirname(filename);
                    const resolvedPath = path.join(mdDir, imgPath).replace(/\\/g, '/');
                    const normalizedPath = path.normalize(resolvedPath).replace(/\\/g, '/');
                    
                    // ビューアー経由のURLに変換
                    return `<img ${prefix}/view/${encodeURIComponent(normalizedPath)}"${suffix}>`;
                }
            );
            
            // Markdown記法の画像も処理
            processedMarkdown = processedMarkdown.replace(
                /!\[([^\]]*)\]\(([^)]+)\)/g,
                (match, alt, imgPath) => {
                    // 絶対パスやHTTPパスはそのまま
                    if (imgPath.startsWith('http') || imgPath.startsWith('/')) {
                        return match;
                    }
                    
                    // 相対パスを解決
                    const mdDir = path.dirname(filename);
                    const resolvedPath = path.join(mdDir, imgPath).replace(/\\/g, '/');
                    const normalizedPath = path.normalize(resolvedPath).replace(/\\/g, '/');
                    
                    // ビューアー経由のURLに変換
                    return `![${alt}](/view/${encodeURIComponent(normalizedPath)})`;
                }
            );
            
            // MarkdownをHTMLに変換
            let html = markdownToHtml(processedMarkdown, {
                customEmbed: {
                    mermaid(content, options) {
                        console.log('Custom mermaid generator called');
                        // 一意のIDを生成
                        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                        
                        // 直接divタグとして埋め込む
                        return `
                            <div class="mermaid-wrapper">
                                <div class="mermaid" id="${id}">${content}</div>
                            </div>
                        `;
                    }
                }
            });
            
            // マーカーを実際のHTMLに置換
            iframeReplacements.forEach(({ marker, html: iframeHtml }) => {
                const escapedMarker = marker.replace(/[\[\]]/g, '\\$&');
                html = html.replace(new RegExp(escapedMarker, 'g'), iframeHtml);
            });
            
            // チャットマーカーを実際のHTMLに置換
            chatReplacements.forEach(({ marker, html: chatHtml }) => {
                const escapedMarker = marker.replace(/[\[\]]/g, '\\$&');
                html = html.replace(new RegExp(escapedMarker, 'g'), chatHtml);
            });
            
            // HTML化後の<a>タグリンクもiframeに変換
            // ただし、iframe-linkクラスを持つリンクは除外
            html = html.replace(
                /<a\s+([^>]*href=")([^"]+\.(?:html|htm))"([^>]*)>([^<]+)<\/a>/g,
                (match, prefix, htmlPath, suffix, linkText) => {
                    // iframe-linkクラスを持つリンクはスキップ
                    if ((prefix + suffix).includes('class="iframe-link"')) {
                        return match;
                    }
                    // 絶対パスや外部URLはスキップ
                    if (htmlPath.startsWith('http') || htmlPath.startsWith('//')) {
                        return match;
                    }
                    return generateIframe(htmlPath, linkText);
                }
            );
            
            const content = `
                <a href="/" class="back-link">← Back to file list</a>
                <div class="markdown-body">
                    ${html}
                </div>
                <script>
                    // iframeの折りたたみ機能
                    function toggleIframe(event, iframeId) {
                        event.preventDefault();
                        const content = document.getElementById('content-' + iframeId);
                        const toggle = document.getElementById('toggle-' + iframeId);
                        
                        if (content.classList.contains('expanded')) {
                            content.classList.remove('expanded');
                            toggle.classList.remove('expanded');
                        } else {
                            content.classList.add('expanded');
                            toggle.classList.add('expanded');
                        }
                    }
                </script>
            `;
            
            res.send(htmlTemplate(filename, content));
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).send('File not found');
        } else {
            res.status(500).send(`Error: ${error.message}`);
        }
    }
});

// HTMLファイルを直接提供するエンドポイント
app.get('/raw/:filename(*)', async (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const filePath = path.join(targetDir, filename);
        
        // セキュリティチェック
        if (filename.includes('..')) {
            return res.status(400).send('Invalid file path');
        }
        
        // HTMLファイルのみ許可
        if (!filename.endsWith('.html') && !filename.endsWith('.htm')) {
            return res.status(400).send('Only HTML files are allowed');
        }
        
        let htmlContent = await fs.readFile(filePath, 'utf-8');
        
        // HTMLファイル内のリンクを変換して、iframe内でのナビゲーションを可能にする
        // href="/view/xxx.html"をhref="/raw/xxx.html"に変換
        htmlContent = htmlContent.replace(
            /href=["']\/view\/([^"']+\.(?:html|htm))["']/gi,
            'href="/raw/$1"'
        );
        
        // HTMLファイル内の相対パスを処理
        const htmlDir = path.dirname(filename);
        const baseUrl = `/view/${encodeURIComponent(htmlDir)}/`;
        
        // <base>タグを追加して相対パスのベースを設定
        if (htmlContent.includes('<head>')) {
            htmlContent = htmlContent.replace(
                '<head>',
                `<head>\n<base href="${baseUrl}">`
            );
        } else if (htmlContent.includes('<html>')) {
            htmlContent = htmlContent.replace(
                '<html>',
                `<html>\n<head>\n<base href="${baseUrl}">\n</head>`
            );
        } else {
            htmlContent = `<head>\n<base href="${baseUrl}">\n</head>\n${htmlContent}`;
        }
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(htmlContent);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).send('File not found');
        } else {
            res.status(500).send(`Error: ${error.message}`);
        }
    }
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