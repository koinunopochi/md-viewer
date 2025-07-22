import markdownToHtml from 'zenn-markdown-html';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { IMarkdownRenderer } from '../../domain/interfaces/IMarkdownRenderer';

export class MarkdownRenderer implements IMarkdownRenderer {
  render(markdown: string): string {
    // まずHTMLコードブロックを一時的にプレースホルダーに置換
    const htmlBlocks: Array<{id: string, content: string}> = [];
    let processedMarkdown = markdown.replace(
      /```html(?::[^\n]*)?\n([\s\S]*?)\n```/g,
      (match, codeContent) => {
        const id = `HTML_PLACEHOLDER_${Math.random().toString(36).substr(2, 9)}`;
        htmlBlocks.push({ id, content: codeContent });
        return `HTML_PLACEHOLDER_${id}`;
      }
    );
    
    let html = markdownToHtml(processedMarkdown, {
      customEmbed: {
        mermaid(content: string) {
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
    
    // HTMLプレースホルダーをHTMLプレビューコンテナに置換
    htmlBlocks.forEach(block => {
      const previewId = `html-preview-${Math.random().toString(36).substr(2, 9)}`;
      const htmlPreview = `
        <div class="html-preview-container" id="${previewId}">
          <div class="html-preview-header">
            <div class="html-preview-title">
              <span class="html-preview-icon">🌐</span>
              HTML Preview
            </div>
            <div class="html-preview-controls">
              <button class="html-toggle-btn active" data-mode="preview" data-target="${previewId}">
                <span class="icon">👁️</span>
                Preview
              </button>
              <button class="html-toggle-btn" data-mode="source" data-target="${previewId}">
                <span class="icon">📝</span>
                Source
              </button>
            </div>
          </div>
          <div class="html-preview-content">
            <div class="html-view active" data-view="preview">
              <iframe src="data:text/html;charset=utf-8,${encodeURIComponent(block.content)}" sandbox="allow-scripts allow-same-origin" frameborder="0"></iframe>
            </div>
            <div class="html-view" data-view="source">
              <pre class="language-html"><code>${this.escapeHtml(block.content)}</code></pre>
            </div>
          </div>
        </div>
      `;
      // プレースホルダー名を修正
      const placeholderPattern = new RegExp(`<p[^>]*>HTML_PLACEHOLDER_${block.id}</p>`, 'g');
      html = html.replace(placeholderPattern, htmlPreview);
    });
    
    // zenn-markdown-htmlによって処理されたHTMLコードブロックも検出して置換
    html = this.processZennHtmlCodeBlocks(html);
    
    return html;
  }

  private processZennHtmlCodeBlocks(html: string): string {
    // zenn-markdown-htmlが生成したHTMLコードブロックを検出
    // より厳密な正規表現で、language-htmlのみをマッチ
    return html.replace(
      /<div class="code-block-container">(<div class="code-block-filename-container">[\s\S]*?<\/div>)?<pre class="language-html"><code[^>]*>([\s\S]*?)<\/code><\/pre><\/div>/g,
      (match, titlePart, codeContent) => {
        // タイトル部分を抽出
        const titleMatch = titlePart ? titlePart.match(/<span class="code-block-filename">([^<]+)<\/span>/) : null;
        const title = titleMatch ? titleMatch[1] : '';
        
        // HTMLコードをデコード
        const decodedContent = this.decodeHtml(codeContent.trim());
        const previewId = `html-preview-${Math.random().toString(36).substr(2, 9)}`;
        
        return `
          <div class="html-preview-container" id="${previewId}">
            <div class="html-preview-header">
              <div class="html-preview-title">
                <span class="html-preview-icon">🌐</span>
                HTML Preview${title ? ` - ${title}` : ''}
              </div>
              <div class="html-preview-controls">
                <button class="html-toggle-btn active" data-mode="preview" data-target="${previewId}">
                  <span class="icon">👁️</span>
                  Preview
                </button>
                <button class="html-toggle-btn" data-mode="source" data-target="${previewId}">
                  <span class="icon">📝</span>
                  Source
                </button>
              </div>
            </div>
            <div class="html-preview-content">
              <div class="html-view active" data-view="preview">
                <iframe src="data:text/html;charset=utf-8,${encodeURIComponent(decodedContent)}" sandbox="allow-scripts allow-same-origin" frameborder="0"></iframe>
              </div>
              <div class="html-view" data-view="source">
                <pre class="language-html"><code>${codeContent}</code></pre>
              </div>
            </div>
          </div>
        `;
      }
    );
  }

  private decodeHtml(encodedHtml: string): string {
    return encodedHtml
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }


  private escapeHtml(html: string): string {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }


  isMarpDocument(markdown: string): boolean {
    const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) return false;
    
    try {
      const frontMatter = yaml.load(frontMatterMatch[1]) as any;
      return frontMatter.marp === true;
    } catch (e) {
      return false;
    }
  }

  processImages(markdown: string, baseUrl: string): string {
    // Process HTML img tags first
    let processed = markdown.replace(
      /<img\s+([^>]*src=")([^"]+)"([^>]*)>/g,
      (match, prefix, src, suffix) => {
        if (src.startsWith('http') || src.startsWith('/')) {
          return match;
        }
        const resolvedPath = path.join(baseUrl, src).replace(/\\/g, '/');
        const normalizedPath = path.normalize(resolvedPath).replace(/\\/g, '/');
        return `<img ${prefix}/view/${encodeURIComponent(normalizedPath)}"${suffix}>`;
      }
    );

    // Process Markdown image syntax ![alt](src)
    processed = processed.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (match, alt, src) => {
        if (src.startsWith('http') || src.startsWith('/')) {
          return match;
        }
        const resolvedPath = path.join(baseUrl, src).replace(/\\/g, '/');
        const normalizedPath = path.normalize(resolvedPath).replace(/\\/g, '/');
        return `![${alt}](/view/${encodeURIComponent(normalizedPath)})`;
      }
    );

    return processed;
  }
}