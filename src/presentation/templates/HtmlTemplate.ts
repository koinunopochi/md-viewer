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
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
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
    `;
  }
}