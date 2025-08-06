export class HtmlTemplate {
  static generate(title: string, content: string): string {
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Pika</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/diff-highlight/prism-diff-highlight.min.css">
    <script src="/js/mermaid.min.js"></script>
    <style>
        ${this.getStyles()}
    </style>
    <script>
        ${this.getScripts()}
    </script>
</head>
<body>
    ${content}
</body>
</html>
`;
  }

  private static getStyles(): string {
    return `
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
            text-align: center;
        }
        .mermaid svg {
            max-width: 100% !important;
            height: auto !important;
            display: inline-block;
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
        /* Prism.js追加スタイル - Zenn風 */
        /* すべてのpreタグに基本スタイルを適用 */
        .znc pre {
            background: #1e1e1e;
            color: #d4d4d4;
            border: 1px solid #30363d;
            border-radius: 8px;
            margin: 1em 0;
            padding: 1.5em;
            overflow-x: auto;
            font-size: 14px;
            line-height: 1.6;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        }
        /* 言語指定ありのコードブロック（ファイル名なし） */
        .znc pre[class*="language-"]:not(.code-block-container pre) {
            border-radius: 8px;
        }
        /* ファイル名付きコードブロック内のpre */
        .code-block-container pre {
            border: none;
            border-radius: 0 0 8px 8px;
            margin: 0;
        }
        .znc pre code {
            background: none;
            padding: 0;
            border: none;
            border-radius: 0;
            color: inherit;
            font-family: inherit;
        }
        /* コードブロックコンテナ */
        .znc > div:has(> pre[class*="language-"]) {
            border-radius: 8px;
            overflow: hidden;
            margin: 1em 0;
            border: 1px solid #30363d;
        }
        /* Dark theme tokens - VS Code Dark+ 風 */
        .znc .token.comment,
        .znc .token.prolog,
        .znc .token.doctype,
        .znc .token.cdata {
            color: #6a9955;
        }
        .znc .token.punctuation {
            color: #d4d4d4;
        }
        .znc .token.property,
        .znc .token.tag,
        .znc .token.boolean,
        .znc .token.number,
        .znc .token.constant,
        .znc .token.symbol,
        .znc .token.deleted {
            color: #569cd6;
        }
        .znc .token.selector,
        .znc .token.attr-name,
        .znc .token.string,
        .znc .token.char,
        .znc .token.builtin,
        .znc .token.inserted {
            color: #ce9178;
        }
        .znc .token.operator,
        .znc .token.entity,
        .znc .token.url,
        .znc .language-css .token.string,
        .znc .style .token.string {
            color: #d4d4d4;
        }
        .znc .token.atrule,
        .znc .token.attr-value,
        .znc .token.keyword {
            color: #c586c0;
        }
        .znc .token.function,
        .znc .token.class-name {
            color: #dcdcaa;
        }
        .znc .token.regex,
        .znc .token.important,
        .znc .token.variable {
            color: #9cdcfe;
        }
        .znc .token.shebang {
            color: #569cd6;
            font-weight: bold;
        }
        .znc .token.parameter {
            color: #9cdcfe;
        }
        /* Filename display - Zenn style */
        .code-block-filename-container {
            background: #30363d;
            border-radius: 8px 8px 0 0;
            padding: 10px 16px;
            font-size: 13px;
            border: 1px solid #30363d;
            border-bottom: 1px solid #484f58;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        }
        .code-block-filename {
            color: #8b949e;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .code-block-filename::before {
            content: "📄";
            font-size: 14px;
        }
        /* Code block container adjustments */
        .code-block-container {
            border: 1px solid #30363d;
            border-radius: 8px;
            overflow: hidden;
            margin: 1em 0;
            background: #1e1e1e;
        }
        .code-block-container pre[class*="language-"] {
            margin: 0;
            border: none;
            border-radius: 0;
        }
        /* CSV表示用スタイル */
        .csv-container {
            margin: 20px 0;
            border: 1px solid #d1d9e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .csv-view-toggle {
            background: #f6f8fa;
            padding: 10px;
            display: flex;
            gap: 10px;
            border-bottom: 1px solid #d1d9e0;
        }
        .csv-toggle-btn {
            padding: 6px 12px;
            border: 1px solid #d1d9e0;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        .csv-toggle-btn:hover {
            background: #f0f0f0;
        }
        .csv-toggle-btn.active {
            background: #0969da;
            color: white;
            border-color: #0969da;
        }
        .csv-toggle-btn .icon {
            font-size: 16px;
        }
        .csv-view {
            display: none;
            padding: 20px;
        }
        .csv-view.active {
            display: block;
        }
        .csv-table-wrapper {
            overflow-x: auto;
        }
        .csv-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        .csv-table th,
        .csv-table td {
            padding: 8px 12px;
            text-align: left;
            border: 1px solid #d1d9e0;
        }
        .csv-table th {
            background: #f6f8fa;
            font-weight: 600;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        .csv-table tbody tr:hover {
            background: #f0f3f6;
        }
        .csv-table tbody tr.even {
            background: #fafbfc;
        }
        .csv-raw-content {
            background: #f6f8fa;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
        }
        .csv-info {
            margin-top: 10px;
            font-size: 14px;
            color: #586069;
        }
        .csv-error {
            padding: 20px;
            color: #d73a49;
        }
        .csv-error h3 {
            margin-top: 0;
            color: #d73a49;
        }
        .csv-error details {
            margin: 10px 0;
            padding: 10px;
            background: #ffeef0;
            border-radius: 6px;
        }
        .csv-error summary {
            cursor: pointer;
            font-weight: 600;
        }
        .csv-error pre {
            margin: 10px 0;
            padding: 10px;
            background: #f6f8fa;
            border-radius: 6px;
            font-size: 12px;
            overflow-x: auto;
        }
        /* ファイルナビゲーション */
        .file-navigation {
            margin-top: 60px;
            padding-top: 40px;
            border-top: 2px solid #e1e4e8;
        }
        .nav-prev-next {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        .nav-prev, .nav-next {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            background: #f6f8fa;
            border: 1px solid #d1d9e0;
            border-radius: 8px;
            text-decoration: none;
            color: #24292e;
            transition: all 0.2s;
            max-width: 45%;
        }
        .nav-prev:hover, .nav-next:hover {
            background: #e1e4e8;
            border-color: #c9c9c9;
            transform: translateY(-1px);
        }
        .nav-disabled {
            visibility: hidden;
        }
        .nav-arrow {
            font-size: 20px;
            color: #0969da;
        }
        .nav-text {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .nav-label {
            font-size: 12px;
            color: #586069;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .nav-filename {
            font-size: 14px;
            font-weight: 500;
        }
        .nav-related {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .nav-section {
            background: #fafbfc;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 16px;
        }
        .nav-section-title {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #24292e;
            font-weight: 600;
        }
        .nav-links {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .nav-file-link {
            display: block;
            padding: 6px 10px;
            background: white;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            text-decoration: none;
            color: #0969da;
            font-size: 13px;
            transition: all 0.2s;
        }
        .nav-file-link:hover {
            background: #f6f8fa;
            border-color: #0969da;
        }
        .nav-more {
            display: block;
            padding: 6px 10px;
            color: #586069;
            font-size: 13px;
            text-align: center;
        }
        /* HTML Preview スタイル */
        .html-preview-container {
            margin: 20px 0;
            border: 1px solid #d1d9e0;
            border-radius: 8px;
            overflow: hidden;
            background: white;
        }
        .html-preview-header {
            background: #f6f8fa;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #d1d9e0;
        }
        .html-preview-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            color: #24292e;
        }
        .html-preview-icon {
            font-size: 16px;
        }
        .html-preview-controls {
            display: flex;
            gap: 4px;
        }
        .html-toggle-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border: 1px solid #d1d9e0;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
        }
        .html-toggle-btn:hover {
            background: #f0f0f0;
        }
        .html-toggle-btn.active {
            background: #0969da;
            color: white;
            border-color: #0969da;
        }
        .html-toggle-btn .icon {
            font-size: 14px;
        }
        .html-preview-content {
            position: relative;
        }
        .html-view {
            display: none;
        }
        .html-view.active {
            display: block;
        }
        .html-view[data-view="preview"] iframe {
            width: 100%;
            min-height: 400px;
            border: none;
            background: white;
        }
        .html-view[data-view="source"] {
            padding: 0;
        }
        .html-view[data-view="source"] pre {
            margin: 0;
            border-radius: 0;
            border: none;
        }
        /* Details/Summary スタイル */
        details {
            background-color: #f6f8fa;
            border: 1px solid #d1d9e0;
            border-radius: 6px;
            padding: 0;
            margin: 16px 0;
        }
        details summary {
            padding: 12px 16px;
            cursor: pointer;
            font-weight: 600;
            user-select: none;
            list-style: none;
        }
        details summary::-webkit-details-marker {
            display: none;
        }
        details summary::before {
            content: '▶';
            display: inline-block;
            margin-right: 8px;
            transition: transform 0.2s;
        }
        details[open] summary::before {
            transform: rotate(90deg);
        }
        details summary:hover {
            background-color: #f0f0f0;
        }
        details > *:not(summary) {
            padding: 0 16px 16px 16px;
        }
        details pre {
            margin: 8px 0;
        }
        /* お知らせ通知スタイル */
        .announcement-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        .announcement-item {
            background: white;
            border: 1px solid #d1d9e0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-bottom: 10px;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .announcement-item.hiding {
            animation: slideOut 0.3s ease forwards;
        }
        .announcement-header {
            padding: 12px 16px;
            background: #f6f8fa;
            border-bottom: 1px solid #d1d9e0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
        }
        .announcement-header:hover {
            background: #ebeef1;
        }
        .announcement-title-section {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }
        .announcement-icon {
            font-size: 18px;
        }
        .announcement-icon.info { color: #0969da; }
        .announcement-icon.warning { color: #f59e0b; }
        .announcement-icon.error { color: #dc2626; }
        .announcement-title {
            font-weight: 600;
            color: #24292e;
            font-size: 14px;
        }
        .announcement-close {
            background: none;
            border: none;
            color: #586069;
            cursor: pointer;
            padding: 4px;
            font-size: 18px;
            line-height: 1;
            transition: color 0.2s;
        }
        .announcement-close:hover {
            color: #24292e;
        }
        .announcement-body {
            padding: 16px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        .announcement-body.expanded {
            max-height: 500px;
            overflow-y: auto;
        }
        .announcement-content {
            color: #24292e;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 8px;
        }
        .announcement-date {
            color: #586069;
            font-size: 12px;
            margin-bottom: 12px;
        }
        .announcement-links {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .announcement-link {
            display: inline-block;
            padding: 6px 12px;
            background: #0969da;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 13px;
            transition: background 0.2s;
        }
        .announcement-link:hover {
            background: #0860ca;
        }
        .announcement-badge {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #dc2626;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            z-index: 9999;
            animation: pulse 2s infinite;
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
        }
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }
        .announcement-error-message {
            padding: 10px 16px;
            background: #fef2f2;
            border-left: 4px solid #dc2626;
            color: #991b1b;
            font-size: 13px;
            margin: 10px 0;
        }
    `;
  }

  private static getScripts(): string {
    return `
        // Mermaid初期化
        mermaid.initialize({ 
            startOnLoad: false,
            theme: 'default',
            themeVariables: {
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
            },
            flowchart: {
                useMaxWidth: false,  // Changed to false to prevent extreme expansion
                htmlLabels: true,
                curve: 'basis',
                diagramPadding: 8,
                rankdir: 'TB'
            },
            sequence: {
                useMaxWidth: false,  // Changed to false
                diagramMarginX: 50,
                diagramMarginY: 10
            },
            er: {
                useMaxWidth: false,  // Changed to false
                entityPadding: 15,
                fontSize: 12,
                minEntityWidth: 100,
                minEntityHeight: 75
            },
            gantt: {
                useMaxWidth: false
            }
        });
        
        // テキスト選択編集機能
        let selectionInfo = null;
        
        // 編集ダイアログの表示
        function showEditDialog() {
            if (!selectionInfo) return;
            
            // 既存のダイアログを削除
            const existingDialog = document.getElementById('edit-dialog');
            if (existingDialog) {
                existingDialog.remove();
            }
            
            // ダイアログ作成
            const dialog = document.createElement('div');
            dialog.id = 'edit-dialog';
            dialog.style.cssText = \`
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 2000;
                max-width: 500px;
                width: 90%;
            \`;
            
            dialog.innerHTML = \`
                <h3 style="margin: 0 0 15px 0; color: #333;">テキストを編集</h3>
                <textarea id="edit-textarea" style="
                    width: 100%;
                    min-height: 100px;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-family: inherit;
                    font-size: 14px;
                    resize: vertical;
                ">\${selectionInfo.text}</textarea>
                <div style="
                    margin-top: 8px;
                    font-size: 12px;
                    color: #666;
                ">
                    <kbd style="
                        padding: 2px 4px;
                        font-size: 11px;
                        background: #f0f0f0;
                        border: 1px solid #ccc;
                        border-radius: 3px;
                    ">Ctrl+Enter</kbd> / <kbd style="
                        padding: 2px 4px;
                        font-size: 11px;
                        background: #f0f0f0;
                        border: 1px solid #ccc;
                        border-radius: 3px;
                    ">⌘+Enter</kbd> で保存
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="cancelEdit()" style="
                        padding: 8px 16px;
                        border: 1px solid #ddd;
                        background: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">キャンセル</button>
                    <button onclick="saveEdit()" style="
                        padding: 8px 16px;
                        border: none;
                        background: #1a73e8;
                        color: white;
                        border-radius: 4px;
                        cursor: pointer;
                    " title="Ctrl+Enter / ⌘+Enter">保存</button>
                </div>
            \`;
            
            document.body.appendChild(dialog);
            
            // オーバーレイ作成
            const overlay = document.createElement('div');
            overlay.id = 'edit-overlay';
            overlay.style.cssText = \`
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 1999;
            \`;
            overlay.addEventListener('click', cancelEdit);
            document.body.appendChild(overlay);
            
            // テキストエリアにフォーカス
            const textarea = document.getElementById('edit-textarea');
            textarea.focus();
            
            // テキストエリアでのキーボードショートカット
            textarea.addEventListener('keydown', function(e) {
                // Ctrl+Enter または Cmd+Enter で保存
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                }
            });
        }
        
        // 編集をキャンセル
        window.cancelEdit = function() {
            const dialog = document.getElementById('edit-dialog');
            const overlay = document.getElementById('edit-overlay');
            if (dialog) dialog.remove();
            if (overlay) overlay.remove();
        }
        
        // 編集を保存
        window.saveEdit = async function() {
            const textarea = document.getElementById('edit-textarea');
            const newText = textarea.value;
            
            if (newText !== selectionInfo.text) {
                try {
                    // ファイルパスを取得
                    const pathMatch = window.location.pathname.match(/^\\/view\\/(.+)$/);
                    if (!pathMatch) {
                        alert('ファイルパスを取得できませんでした');
                        return;
                    }
                    
                    const filePath = decodeURIComponent(pathMatch[1]);
                    
                    // APIリクエストを送信
                    const response = await fetch('/api/edit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            filePath: filePath,
                            originalText: selectionInfo.text,
                            newText: newText,
                            startOffset: selectionInfo.startOffset,
                            endOffset: selectionInfo.endOffset
                        })
                    });
                    
                    if (response.ok) {
                        // 成功したらページをリロード
                        window.location.reload();
                    } else {
                        const error = await response.text();
                        alert('保存に失敗しました: ' + error);
                    }
                } catch (error) {
                    alert('エラーが発生しました: ' + error.message);
                }
            }
            
            cancelEdit();
        }
        
        // 選択テキストの位置を取得
        function getSelectionInfo() {
            const selection = window.getSelection();
            if (!selection.rangeCount || selection.isCollapsed) return null;
            
            const range = selection.getRangeAt(0);
            const text = selection.toString().trim();
            if (!text) return null;
            
            // markdownコンテンツ内の選択のみ対象
            const markdownBody = document.querySelector('.markdown-body');
            if (!markdownBody || !markdownBody.contains(range.commonAncestorContainer)) {
                return null;
            }
            
            // 選択範囲の座標を取得
            const rect = range.getBoundingClientRect();
            
            // マークダウンソース内でのオフセットを計算（簡易版）
            // 実際の実装では、より正確な方法が必要
            return {
                text: text,
                rect: rect,
                startOffset: 0, // TODO: 実際のオフセット計算を実装
                endOffset: 0    // TODO: 実際のオフセット計算を実装
            };
        }
        
        // キーボードショートカットハンドラ
        document.addEventListener('keydown', function(e) {
            // Ctrl+E または Cmd+E で編集
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                const tempSelectionInfo = getSelectionInfo();
                if (tempSelectionInfo) {
                    e.preventDefault();
                    selectionInfo = tempSelectionInfo;
                    showEditDialog();
                }
            }
            
            // Escapeでダイアログを閉じる
            if (e.key === 'Escape') {
                const dialog = document.getElementById('edit-dialog');
                if (dialog) {
                    cancelEdit();
                }
            }
        });
        
        // 選択時にツールチップを表示
        document.addEventListener('selectionchange', function() {
            const tempSelectionInfo = getSelectionInfo();
            if (tempSelectionInfo && !document.getElementById('selection-tooltip')) {
                // 既存の選択情報を更新
                selectionInfo = tempSelectionInfo;
                
                // ツールチップを作成
                const tooltip = document.createElement('div');
                tooltip.id = 'selection-tooltip';
                tooltip.style.cssText = \`
                    position: fixed;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    z-index: 9999;
                    pointer-events: none;
                    animation: fadeIn 0.2s ease;
                \`;
                tooltip.innerHTML = 'Ctrl+E で編集 (Mac: ⌘+E)';
                
                // 位置を設定
                const rect = tempSelectionInfo.rect;
                tooltip.style.left = (rect.left + rect.width / 2 - 60) + 'px';
                tooltip.style.top = (rect.top - 30) + 'px';
                
                document.body.appendChild(tooltip);
                
                // 2秒後に自動で削除
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.style.animation = 'fadeOut 0.2s ease';
                        setTimeout(() => tooltip.remove(), 200);
                    }
                }, 2000);
            } else if (!tempSelectionInfo) {
                // 選択が解除されたらツールチップを削除
                const tooltip = document.getElementById('selection-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            }
        });
        
        // お知らせ通知管理
        class AnnouncementManager {
            constructor() {
                this.STORAGE_KEY = 'pika_announcement_states';
                this.API_URL = 'https://pika.lynxes.org/api/tools/announcements';
                this.CHECK_INTERVAL = 60 * 60 * 1000; // 1時間
                this.container = null;
                this.announcements = [];
                this.expandedIds = new Set();
            }

            async init() {
                await this.checkAnnouncements();
                // 定期チェック
                setInterval(() => this.checkAnnouncements(), this.CHECK_INTERVAL);
            }

            async fetchAnnouncements() {
                try {
                    const response = await fetch(this.API_URL);
                    if (!response.ok) {
                        throw new Error(\`HTTP error! status: \${response.status}\`);
                    }
                    const data = await response.json();
                    return data.announcements || [];
                } catch (error) {
                    console.error('Failed to fetch announcements:', error);
                    this.showError('お知らせの取得に失敗しました');
                    return [];
                }
            }

            getStates() {
                try {
                    const stored = localStorage.getItem(this.STORAGE_KEY);
                    return stored ? JSON.parse(stored) : [];
                } catch {
                    return [];
                }
            }

            saveStates(states) {
                try {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
                } catch (error) {
                    console.error('Failed to save announcement states:', error);
                }
            }

            async checkAnnouncements() {
                const announcements = await this.fetchAnnouncements();
                const states = this.getStates();
                const dismissedIds = new Set(states.filter(s => s.isDismissed).map(s => s.id));
                
                const unread = announcements.filter(a => !dismissedIds.has(a.id));
                
                if (unread.length > 0) {
                    this.showAnnouncements(unread);
                }
            }

            showAnnouncements(announcements) {
                this.announcements = announcements;
                
                if (!this.container) {
                    this.container = document.createElement('div');
                    this.container.className = 'announcement-container';
                    document.body.appendChild(this.container);
                }

                this.container.innerHTML = '';
                
                announcements.forEach(announcement => {
                    const item = this.createAnnouncementElement(announcement);
                    this.container.appendChild(item);
                });

                // バッジも表示
                this.updateBadge(announcements.length);
            }

            createAnnouncementElement(announcement) {
                const item = document.createElement('div');
                item.className = 'announcement-item';
                item.dataset.id = announcement.id;

                const iconMap = {
                    info: 'ℹ️',
                    warning: '⚠️',
                    error: '❌'
                };
                const icon = iconMap[announcement.priority] || 'ℹ️';

                const formattedDate = new Date(announcement.date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                item.innerHTML = \`
                    <div class="announcement-header" onclick="announcementManager.toggleExpand('\${announcement.id}')">
                        <div class="announcement-title-section">
                            <span class="announcement-icon \${announcement.priority || 'info'}">\${icon}</span>
                            <div class="announcement-title">\${this.escapeHtml(announcement.title)}</div>
                        </div>
                        <button class="announcement-close" onclick="event.stopPropagation(); announcementManager.dismiss('\${announcement.id}')">×</button>
                    </div>
                    <div class="announcement-body" id="announcement-body-\${announcement.id}">
                        <div class="announcement-date">\${formattedDate}</div>
                        <div class="announcement-content">\${this.escapeHtml(announcement.content)}</div>
                        \${announcement.links ? \`
                            <div class="announcement-links">
                                \${announcement.links.map(link => \`
                                    <a href="\${this.escapeHtml(link.url)}" class="announcement-link" target="_blank">
                                        \${this.escapeHtml(link.text)}
                                    </a>
                                \`).join('')}
                            </div>
                        \` : ''}
                    </div>
                \`;

                // 初回は最初の1件だけ展開
                if (this.announcements.indexOf(announcement) === 0) {
                    setTimeout(() => this.toggleExpand(announcement.id), 100);
                }

                return item;
            }

            toggleExpand(id) {
                const body = document.getElementById(\`announcement-body-\${id}\`);
                if (body) {
                    if (this.expandedIds.has(id)) {
                        body.classList.remove('expanded');
                        this.expandedIds.delete(id);
                    } else {
                        body.classList.add('expanded');
                        this.expandedIds.add(id);
                    }
                }
            }

            dismiss(id) {
                const states = this.getStates();
                const existingIndex = states.findIndex(s => s.id === id);
                
                const newState = {
                    id: id,
                    dismissedAt: new Date().toISOString(),
                    isDismissed: true
                };

                if (existingIndex >= 0) {
                    states[existingIndex] = newState;
                } else {
                    states.push(newState);
                }
                
                this.saveStates(states);

                // UIから削除
                const item = document.querySelector(\`.announcement-item[data-id="\${id}"]\`);
                if (item) {
                    item.classList.add('hiding');
                    setTimeout(() => {
                        item.remove();
                        this.announcements = this.announcements.filter(a => a.id !== id);
                        this.updateBadge(this.announcements.length);
                        
                        // すべて閉じたらコンテナも削除
                        if (this.announcements.length === 0 && this.container) {
                            this.container.remove();
                            this.container = null;
                        }
                    }, 300);
                }
            }

            updateBadge(count) {
                let badge = document.getElementById('announcement-badge');
                
                if (count > 0) {
                    if (!badge) {
                        badge = document.createElement('div');
                        badge.id = 'announcement-badge';
                        badge.className = 'announcement-badge';
                        badge.onclick = () => this.showAllAnnouncements();
                        document.body.appendChild(badge);
                    }
                    badge.textContent = count;
                    badge.style.display = 'flex';
                } else {
                    if (badge) {
                        badge.style.display = 'none';
                    }
                }
            }

            showAllAnnouncements() {
                if (this.announcements.length > 0) {
                    this.showAnnouncements(this.announcements);
                    // すべて展開
                    this.announcements.forEach(a => {
                        if (!this.expandedIds.has(a.id)) {
                            this.toggleExpand(a.id);
                        }
                    });
                }
            }

            showError(message) {
                if (!this.container) {
                    this.container = document.createElement('div');
                    this.container.className = 'announcement-container';
                    document.body.appendChild(this.container);
                }

                const errorDiv = document.createElement('div');
                errorDiv.className = 'announcement-error-message';
                errorDiv.textContent = message;
                this.container.appendChild(errorDiv);
                
                setTimeout(() => {
                    errorDiv.remove();
                    if (this.container && this.container.children.length === 0) {
                        this.container.remove();
                        this.container = null;
                    }
                }, 5000);
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        }

        // グローバルインスタンス作成
        const announcementManager = new AnnouncementManager();

        // ページ読み込み後にMermaidを実行
        document.addEventListener('DOMContentLoaded', async function() {
            const mermaidElements = document.querySelectorAll('.mermaid');
            console.log('Found mermaid elements:', mermaidElements.length);
            
            if (mermaidElements.length > 0) {
                await mermaid.run({
                    querySelector: '.mermaid'
                });
            }
            
            // HTML Preview切り替え機能
            initializeHtmlPreviews();
            
            // お知らせ通知機能を初期化
            announcementManager.init();
            
            // アニメーションスタイルを追加
            const style = document.createElement('style');
            style.textContent = \`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(10px); }
                }
                
                /* ショートカットヒント */
                .shortcut-hint {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 10px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }
                
                .shortcut-hint.visible {
                    opacity: 1;
                }
                
                /* キーボードキースタイル */
                kbd {
                    display: inline-block;
                    padding: 2px 6px;
                    font-size: 11px;
                    line-height: 1.4;
                    color: #444;
                    background-color: #fafafa;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    box-shadow: 0 1px 0 rgba(0,0,0,0.2);
                    font-family: monospace;
                    white-space: nowrap;
                }
            \`;
            document.head.appendChild(style);
            
            // ショートカットヒントを追加
            const hint = document.createElement('div');
            hint.className = 'shortcut-hint';
            hint.innerHTML = 'テキストを選択して <kbd>Ctrl+E</kbd> で編集 (Mac: <kbd>⌘+E</kbd>)';
            document.body.appendChild(hint);
            
            // 初回のみヒントを表示
            setTimeout(() => {
                hint.classList.add('visible');
                setTimeout(() => {
                    hint.classList.remove('visible');
                }, 5000);
            }, 1000);
        });
        
        function initializeHtmlPreviews() {
            const toggleButtons = document.querySelectorAll('.html-toggle-btn');
            
            toggleButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const mode = this.dataset.mode;
                    const containerId = this.dataset.target;
                    const container = document.getElementById(containerId);
                    
                    if (!container) return;
                    
                    // ボタンのアクティブ状態を切り替え
                    const allButtons = container.querySelectorAll('.html-toggle-btn');
                    allButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // ビューの切り替え
                    const allViews = container.querySelectorAll('.html-view');
                    allViews.forEach(view => view.classList.remove('active'));
                    
                    const targetView = container.querySelector(\`[data-view="\${mode}"]\`);
                    if (targetView) {
                        targetView.classList.add('active');
                    }
                });
            });
        }
    `;
  }
}