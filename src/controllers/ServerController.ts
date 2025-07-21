import { Request, Response } from 'express';
import * as path from 'path';
import { IFileService } from '../interfaces/IFileService';
import { IPathResolver } from '../interfaces/IPathResolver';
import { IDirectoryTreeBuilder } from '../interfaces/IDirectoryTreeBuilder';
import { IMarkdownRenderer } from '../interfaces/IMarkdownRenderer';
import { IMarpRenderer } from '../interfaces/IMarpRenderer';
import { IServerController } from '../interfaces/IServerController';
import { TreeNode } from '../models/TreeNode';

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
          const processedContent = this.markdownRenderer.processImages(content, path.dirname(filename));
          const html = this.markdownRenderer.render(processedContent);
          const fullHtml = this.wrapInTemplate(filename, html);
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
      const content = await this.fileService.readFile(filePath);
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
    
    return this.wrapInTemplate('Pika Document Viewer', `
      <div class="file-list">
        <h2>Document Files</h2>
        <p>📁 Directory: ${this.baseDir}</p>
        <p>✅ View Markdown and HTML files</p>
        <p>✅ Direct Mermaid rendering without iframes</p>
        ${recursive ? '<p>🔄 Recursive search: Enabled</p>' : ''}
        <p>💡 Click directories to expand/collapse</p>
        <ul class="tree-root">${fileListHtml}</ul>
      </div>
    `);
  }

  private renderTreeNode(node: TreeNode, depth: number = 0): string {
    let html = '';
    
    if (node.type === 'directory' && depth > 0) {
      const fileCount = this.treeBuilder.getFileCount(node);
      html += `<li class="directory">
        <div class="directory-header" style="padding-left: ${depth * 20}px">
          <span>📁 ${node.name}</span>
          ${fileCount > 0 ? `<span class="file-count">(${fileCount})</span>` : ''}
        </div>`;
      
      if (node.children.length > 0) {
        html += '<ul class="file-sublist">';
        node.children.forEach(child => {
          html += this.renderTreeNode(child, depth + 1);
        });
        html += '</ul>';
      }
      html += '</li>';
    } else if (node.type === 'file') {
      const icon = node.name.endsWith('.md') ? '📝' : '🌐';
      html += `<li class="file" style="padding-left: ${depth * 20}px">
        ${icon} <a href="/view/${encodeURIComponent(node.relativePath)}">${node.name}</a>
      </li>`;
    } else if (depth === 0) {
      // Root node
      node.children.forEach(child => {
        html += this.renderTreeNode(child, depth + 1);
      });
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
}