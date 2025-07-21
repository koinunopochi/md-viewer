import { Request, Response } from 'express';
import * as path from 'path';
import { IFileService } from '../../domain/interfaces/IFileService';
import { IPathResolver } from '../../domain/interfaces/IPathResolver';
import { IDirectoryTreeBuilder } from '../../domain/interfaces/IDirectoryTreeBuilder';
import { IMarkdownRenderer } from '../../domain/interfaces/IMarkdownRenderer';
import { IMarpRenderer } from '../../domain/interfaces/IMarpRenderer';
import { ICsvRenderer } from '../../domain/interfaces/ICsvRenderer';
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
    private csvRenderer: ICsvRenderer,
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
      if (this.fileService.isImageFile(filename)) {
        // Check file exists first
        if (!(await this.fileService.fileExists(filePath))) {
          console.error(`Image file not found: ${filePath}`);
          console.error(`Requested filename: ${filename}`);
          console.error(`Base directory: ${this.baseDir}`);
          res.status(404).send('Image file not found');
          return;
        }
        res.sendFile(filePath, (err) => {
          if (err) {
            console.error(`Error sending file ${filePath}:`, err);
            res.status(404).send('File not found');
          }
        });
        return;
      }
      
      // Check file type
      if (!this.fileService.isMarkdownFile(filename) && 
          !this.fileService.isHtmlFile(filename) &&
          !this.fileService.isCsvFile(filename)) {
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
          
          // Store replacements
          const chatReplacements: Array<{ marker: string; html: string }> = [];
          const iframeReplacements: Array<{ marker: string; html: string }> = [];
          
          // Process chat format and replace with markers
          const chatConverter = new ChatConverter();
          let chatIndex = 0;
          processedContent = processedContent.replace(
            /<!-- CHAT-CONVERSION-START: ([^>]+) -->([\s\S]*?)<!-- CHAT-CONVERSION-END -->/g,
            (match, chatId, chatContent) => {
              const chatHtml = chatConverter.convertChatToHTML(chatId, chatContent);
              if (chatHtml) {
                const marker = `[[CHAT_MARKER_${chatIndex}]]`;
                chatReplacements.push({ marker, html: chatHtml });
                chatIndex++;
                return marker;
              }
              return match;
            }
          );
          
          // Process iframe links in markdown and replace with markers
          let iframeIndex = 0;
          processedContent = processedContent.replace(
            /\[([^\]]+)\]\(([^)]+\.(?:html|htm))\)/g,
            (match, text, htmlPath) => {
              if (htmlPath.startsWith('http') || htmlPath.startsWith('//')) {
                return match;
              }
              const marker = `[[IFRAME_MARKER_${iframeIndex}]]`;
              iframeReplacements.push({ 
                marker, 
                html: this.generateIframe(htmlPath, text, filename) 
              });
              iframeIndex++;
              return marker;
            }
          );
          
          // Process explicit iframe tags
          processedContent = processedContent.replace(
            /<iframe\s+([^>]*src=")([^"]+)"([^>]*)><\/iframe>/g,
            (_match, prefix, iframeSrc, suffix) => {
              const titleMatch = (prefix + suffix).match(/title="([^"]+)"/);
              const title = titleMatch ? titleMatch[1] : null;
              const marker = `[[IFRAME_MARKER_${iframeIndex}]]`;
              iframeReplacements.push({ 
                marker, 
                html: this.generateIframe(iframeSrc, title || '', filename) 
              });
              iframeIndex++;
              return marker;
            }
          );
          
          // Process images
          processedContent = this.markdownRenderer.processImages(processedContent, path.dirname(filename));
          
          // Render markdown
          let html = this.markdownRenderer.render(processedContent);
          
          // Replace markers with actual HTML
          iframeReplacements.forEach(({ marker, html: iframeHtml }) => {
            const escapedMarker = marker.replace(/[\[\]]/g, '\\$&');
            html = html.replace(new RegExp(escapedMarker, 'g'), iframeHtml);
          });
          
          // Replace chat markers with actual HTML
          chatReplacements.forEach(({ marker, html: chatHtml }) => {
            const escapedMarker = marker.replace(/[\[\]]/g, '\\$&');
            html = html.replace(new RegExp(escapedMarker, 'g'), chatHtml);
          });
          
          // Process HTML links that might have been generated
          html = this.processHtmlIframeLinks(html, filename);
          
          const backLink = '<a href="/" class="back-link">← Back to file list</a>';
          const fullContent = backLink + '<div class="markdown-body">' + html + '</div>' + this.getIframeScript();
          const fullHtml = HtmlTemplate.generate(filename, fullContent);
          res.send(fullHtml);
        }
      } else if (this.fileService.isCsvFile(filename)) {
        // Handle CSV files
        const csvHtml = this.csvRenderer.render(content);
        const backLink = '<a href="/" class="back-link">← Back to file list</a>';
        const fullContent = backLink + csvHtml;
        const fullHtml = HtmlTemplate.generate(filename, fullContent);
        res.send(fullHtml);
      } else {
        // Handle HTML files
        // Check if request is from iframe
        const referer = req.get('referer');
        const isFromIframe = referer && referer.includes('/raw/');
        
        if (isFromIframe) {
          // Redirect to raw HTML endpoint for iframe navigation
          res.redirect(`/raw/${encodeURIComponent(filename)}`);
          return;
        }
        
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
        <p>✅ View Markdown, HTML, CSV, and Image files</p>
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
      let icon = '📄';
      if (node.name.endsWith('.md')) {
        icon = '📝';
      } else if (node.name.endsWith('.csv')) {
        icon = '📊';
      } else if (this.fileService.isImageFile(node.name)) {
        icon = '🖼️';
      } else if (this.fileService.isHtmlFile(node.name)) {
        icon = '🌐';
      }
      
      html += `<li class="file" style="padding-left: ${depth * 20}px">
        <span style="width: 12px; display: inline-block;"></span>
        ${icon} <a href="/view/${encodeURIComponent(node.relativePath)}">${node.name}</a>
      </li>`;
    }
    
    return html;
  }


  private wrapHtmlFile(filename: string, _content: string): string {
    const backLink = '<a href="/" class="back-link">← Back to file list</a>';
    const iframeContent = `
      <div style="border: 1px solid #d1d9e0; border-radius: 6px; margin: 20px 0;">
        <iframe 
          id="content-frame"
          src="/raw/${encodeURIComponent(filename)}" 
          style="width: 100%; height: calc(100vh - 100px); border: none; border-radius: 6px;"
          sandbox="allow-scripts allow-same-origin allow-top-navigation"
        ></iframe>
      </div>
    `;
    return HtmlTemplate.generate(filename, backLink + iframeContent);
  }



  private processHtmlIframeLinks(html: string, currentFile: string): string {
    
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
    const iframeId = `iframe-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
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