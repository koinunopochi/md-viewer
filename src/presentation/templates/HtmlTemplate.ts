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
    `;
  }
}