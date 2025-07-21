import markdownToHtml from 'zenn-markdown-html';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { IMarkdownRenderer } from '../interfaces/IMarkdownRenderer';

export class MarkdownRenderer implements IMarkdownRenderer {
  render(markdown: string): string {
    return markdownToHtml(markdown);
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
    // Process Markdown image syntax ![alt](src)
    let processed = markdown.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (match, alt, src) => {
        if (src.startsWith('http') || src.startsWith('//')) {
          return match;
        }
        const resolvedPath = path.join(baseUrl, src).replace(/\\/g, '/');
        return `![${alt}](${resolvedPath})`;
      }
    );

    // Process HTML img tags
    processed = processed.replace(
      /<img\s+([^>]*src=")([^"]+)"([^>]*)>/g,
      (match, prefix, src, suffix) => {
        if (src.startsWith('http') || src.startsWith('//')) {
          return match;
        }
        const resolvedPath = path.join(baseUrl, src).replace(/\\/g, '/');
        return `<img ${prefix}${resolvedPath}"${suffix}>`;
      }
    );

    return processed;
  }
}