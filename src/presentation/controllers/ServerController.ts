import { Request, Response } from 'express';
import * as path from 'path';
import { IFileService } from '../../domain/interfaces/IFileService';
import { IPathResolver } from '../../domain/interfaces/IPathResolver';
import { IDirectoryTreeBuilder } from '../../domain/interfaces/IDirectoryTreeBuilder';
import { IMarkdownRenderer } from '../../domain/interfaces/IMarkdownRenderer';
import { IMarpRenderer } from '../../domain/interfaces/IMarpRenderer';
import { IServerController } from './IServerController';
import { TreeNode } from '../../domain/entities/TreeNode';
import { HtmlTemplate } from '../templates/HtmlTemplate';
import { ChatConverter } from '../../infrastructure/renderers/ChatConverter';

export class ServerController implements IServerController {
  constructor(
    private fileService: IFileService,
    private pathResolver: IPathResolver,
    private treeBuilder: IDirectoryTreeBuilder,
    private markdownRenderer: IMarkdownRenderer,
    private marpRenderer: IMarpRenderer,
    private baseDir: string
  ) {}

  async handleIndex(req: Request, res: Response, recursive: boolean): Promise<void> {
    try {
      const tree = await this.treeBuilder.buildTree(this.baseDir, recursive);
      const html = this.renderFileList(tree, recursive);
      res.send(html);
    } catch (error) {
      res.status(500).send(`Error: ${(error as Error).message}`);
    }
  }

  async handleViewFile(req: Request, res: Response): Promise<void> {
    try {
      const filename = decodeURIComponent(req.params.filename);
      
      // Security check
      if (!this.pathResolver.isPathSafe(filename)) {
        res.status(400).send('Invalid file path');
        return;
      }

      const filePath = this.pathResolver.resolvePath(filename);
      
      // Check if it's an image file
      if (this.isImageFile(filename)) {
        res.sendFile(filePath);
        return;
      }
      
      // Check file type
      if (!this.fileService.isMarkdownFile(filename) && !this.fileService.isHtmlFile(filename)) {
        res.status(400).send('Invalid file type');
        return;
      }

      // Check file exists
      if (!(await this.fileService.fileExists(filePath))) {
        res.status(404).send('File not found');
        return;
      }

      const content = await this.fileService.readFile(filePath);

      if (this.fileService.isMarkdownFile(filename)) {
        // Handle Markdown files
        if (this.markdownRenderer.isMarpDocument(content)) {
          // Render as Marp presentation
          const { html, css } = this.marpRenderer.render(content);
          const fullHtml = this.marpRenderer.wrapInSlideTemplate(html, css, filename);
          res.send(fullHtml);
        } else {
          // Render as regular Markdown
          let processedContent = content;
          const chatConverter = new ChatConverter();
          
          // Process chat format if any
          if (chatConverter.isConvertibleChat(processedContent)) {
            processedContent = chatConverter.processChats(processedContent);
          }
          
          // Process images
          processedContent = this.markdownRenderer.processImages(processedContent, path.dirname(filename));
          
          // Process iframe links
          processedContent = this.processIframeLinks(processedContent, filename);
          
          // Render markdown
          let html = this.markdownRenderer.render(processedContent);
          
          // Process HTML links that might have been generated
          html = this.processHtmlIframeLinks(html, filename);
          
          const backLink = '<a href="/" class="back-link">← Back to file list</a>';
          const fullContent = backLink + '<div class="markdown-body">' + html + '</div>' + this.getIframeScript();
          const fullHtml = HtmlTemplate.generate(filename, fullContent);
          res.send(fullHtml);
        }
      } else {
        // Handle HTML files
        const fullHtml = this.wrapHtmlFile(filename, content);
        res.send(fullHtml);
      }
    } catch (error) {
      res.status(500).send(`Error: ${(error as Error).message}`);
    }
  }

  async handleRawHtml(req: Request, res: Response): Promise<void> {
    try {
      const filename = decodeURIComponent(req.params.filename);
      
      // Security check
      if (!this.pathResolver.isPathSafe(filename)) {
        res.status(400).send('Invalid file path');
        return;
      }

      // Only allow HTML files
      if (!this.fileService.isHtmlFile(filename)) {
        res.status(400).send('Only HTML files are allowed');
        return;
      }

      const filePath = this.pathResolver.resolvePath(filename);
      
      // Check file exists
      if (!(await this.fileService.fileExists(filePath))) {
        res.status(404).send('File not found');
        return;
      }
      
      let content = await this.fileService.readFile(filePath);
      
      // Process HTML content for iframe navigation
      content = content.replace(
        /href=["']\/view\/([^"']+\.(?:html|htm))["']/gi,
        'href="/raw/$1"'
      );
      
      // Add base tag for relative paths
      const htmlDir = path.dirname(filename);
      const baseUrl = `/view/${encodeURIComponent(htmlDir)}/`;
      
      if (content.includes('<head>')) {
        content = content.replace(
          '<head>',
          `<head>\n<base href="${baseUrl}">`
        );
      } else if (content.includes('<html>')) {
        content = content.replace(
          '<html>',
          `<html>\n<head>\n<base href="${baseUrl}">\n</head>`
        );
      } else {
        content = `<head>\n<base href="${baseUrl}">\n</head>\n${content}`;
      }
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(content);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        res.status(404).send('File not found');
      } else {
        res.status(500).send(`Error: ${(error as Error).message}`);
      }
    }
  }

  private renderFileList(tree: TreeNode, recursive: boolean): string {
    const fileListHtml = this.renderTreeNode(tree);
    
    const content = `
      <div class="file-list">
        <h2>Document Files</h2>
        <p>📁 Directory: ${this.baseDir}</p>
        <p>✅ View Markdown and HTML files</p>
        <p>✅ Direct Mermaid rendering without iframes</p>
        ${recursive ? '<p>🔄 Recursive search: Enabled</p>' : ''}
        <p>💡 Click directories to expand/collapse</p>
        <ul class="tree-root">${fileListHtml}</ul>
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
    
    return HtmlTemplate.generate('Pika Document Viewer', content);
  }

  private renderTreeNode(node: TreeNode, depth: number = 0): string {
    let html = '';
    
    if (node.type === 'directory' && (depth > 0 || node.children.length > 0)) {
      const fileCount = this.treeBuilder.getFileCount(node);
      const dirId = `dir-${node.relativePath.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const hasChildren = node.children.length > 0;
      
      if (depth > 0) {
        html += `<li class="directory">
          <div class="directory-header" ${hasChildren ? `onclick="toggleDirectory('${dirId}')"` : ''} style="padding-left: ${depth * 20}px">
            ${hasChildren ? `<span class="directory-toggle" id="toggle-${dirId}">▶</span>` : '<span style="width: 12px; display: inline-block;"></span>'}
            <span>📁 ${node.name}</span>
            ${fileCount > 0 ? `<span class="file-count">(${fileCount})</span>` : ''}
          </div>`;
        
        if (hasChildren) {
          html += `<ul class="file-sublist" id="${dirId}">`;
        }
      }
      
      // Render children
      node.children.forEach(child => {
        html += this.renderTreeNode(child, depth + 1);
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
  }

  private wrapInTemplate(title: string, content: string): string {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Pika</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
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
            padding-left: 20px;
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
    </style>
</head>
<body>
    ${content.includes('class="file-list"') ? '' : '<a href="/" class="back-link">← Back to file list</a>'}
    ${content.includes('class="markdown-body"') ? content : `<div class="markdown-body">${content}</div>`}
</body>
</html>`;
  }

  private wrapHtmlFile(filename: string, content: string): string {
    return this.wrapInTemplate(filename, `
      <div style="border: 1px solid #d1d9e0; border-radius: 6px; margin: 20px 0;">
        <iframe 
          src="/raw/${encodeURIComponent(filename)}" 
          style="width: 100%; height: calc(100vh - 100px); border: none; border-radius: 6px;"
        ></iframe>
      </div>
    `);
  }

  private isImageFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext);
  }

  private processIframeLinks(markdown: string, currentFile: string): string {
    let iframeCounter = 0;
    const iframeReplacements: Array<{ marker: string; html: string }> = [];
    
    // Process markdown links to HTML files
    let processed = markdown.replace(
      /\[([^\]]+)\]\(([^)]+\.(?:html|htm))\)/g,
      (match, text, htmlPath) => {
        if (htmlPath.startsWith('http') || htmlPath.startsWith('//')) {
          return match;
        }
        const marker = `[[IFRAME_MARKER_${iframeCounter}]]`;
        iframeReplacements.push({ 
          marker, 
          html: this.generateIframe(htmlPath, text, currentFile) 
        });
        iframeCounter++;
        return marker;
      }
    );
    
    // Replace markers with actual HTML
    iframeReplacements.forEach(({ marker, html }) => {
      const escapedMarker = marker.replace(/[\[\]]/g, '\\$&');
      processed = processed.replace(new RegExp(escapedMarker, 'g'), html);
    });
    
    return processed;
  }

  private processHtmlIframeLinks(html: string, currentFile: string): string {
    let iframeCounter = 0;
    
    // Process HTML links but skip iframe-link class
    return html.replace(
      /<a\s+([^>]*href=")([^"]+\.(?:html|htm))"([^>]*)>([^<]+)<\/a>/g,
      (match, prefix, htmlPath, suffix, linkText) => {
        if ((prefix + suffix).includes('class="iframe-link"')) {
          return match;
        }
        if (htmlPath.startsWith('http') || htmlPath.startsWith('//')) {
          return match;
        }
        return this.generateIframe(htmlPath, linkText, currentFile);
      }
    );
  }

  private generateIframe(src: string, title: string, currentFile: string): string {
    const iframeId = `iframe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Resolve relative paths
    let resolvedSrc = src;
    if (!src.startsWith('http') && !src.startsWith('/')) {
      const mdDir = path.dirname(currentFile);
      const resolvedPath = path.join(mdDir, src).replace(/\\/g, '/');
      const normalizedPath = path.normalize(resolvedPath).replace(/\\/g, '/');
      resolvedSrc = `/view/${encodeURIComponent(normalizedPath)}`;
    }
    
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
  }

  private getIframeScript(): string {
    return `
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
</script>`;
  }
}