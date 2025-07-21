import markdownToHtml from 'zenn-markdown-html';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { IMarkdownRenderer } from '../../domain/interfaces/IMarkdownRenderer';

export class MarkdownRenderer implements IMarkdownRenderer {
  render(markdown: string): string {
    return markdownToHtml(markdown, {
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