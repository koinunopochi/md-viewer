import { ServerController } from '../../presentation/controllers/ServerController';
import { IFileService } from '../../domain/interfaces/IFileService';
import { IPathResolver } from '../../domain/interfaces/IPathResolver';
import { IDirectoryTreeBuilder } from '../../domain/interfaces/IDirectoryTreeBuilder';
import { IMarkdownRenderer } from '../../domain/interfaces/IMarkdownRenderer';
import { IMarpRenderer, MarpRenderResult } from '../../domain/interfaces/IMarpRenderer';
import { TreeNode } from '../../domain/entities/TreeNode';
import { Request, Response } from 'express';

// Mock implementations
class MockFileService implements IFileService {
  async readFile(filePath: string): Promise<string> {
    if (filePath.includes('marp.md')) {
      return '---\nmarp: true\n---\n# Slide';
    }
    return '# Test Markdown\nContent';
  }
  async fileExists(filePath: string): Promise<boolean> {
    return !filePath.includes('notfound');
  }
  isMarkdownFile(filePath: string): boolean {
    return filePath.endsWith('.md');
  }
  isHtmlFile(filePath: string): boolean {
    return filePath.endsWith('.html');
  }
}

class MockPathResolver implements IPathResolver {
  resolvePath(filePath: string): string {
    return `/base/${filePath}`;
  }
  isPathSafe(filePath: string): boolean {
    return !filePath.includes('..');
  }
  getRelativePath(absolutePath: string): string {
    return absolutePath.replace('/base/', '');
  }
  isExcluded(filePath: string): boolean {
    return false;
  }
}

class MockDirectoryTreeBuilder implements IDirectoryTreeBuilder {
  async buildTree(dir: string, recursive: boolean): Promise<TreeNode> {
    const root = new TreeNode('test', 'directory');
    root.addChild(new TreeNode('file1.md', 'file', 'file1.md'));
    root.addChild(new TreeNode('file2.html', 'file', 'file2.html'));
    return root;
  }
  getFileCount(node: TreeNode): number {
    return 2;
  }
}

class MockMarkdownRenderer implements IMarkdownRenderer {
  render(markdown: string): string {
    return `<h1>Rendered</h1><p>${markdown}</p>`;
  }
  isMarpDocument(markdown: string): boolean {
    return markdown.includes('marp: true');
  }
  processImages(markdown: string, baseUrl: string): string {
    return markdown.replace('./img.png', `${baseUrl}/img.png`);
  }
}

class MockMarpRenderer implements IMarpRenderer {
  render(markdown: string): MarpRenderResult {
    return {
      html: '<section>Slide 1</section>',
      css: 'body { color: black; }'
    };
  }
  countSlides(html: string): number {
    return 1;
  }
  wrapInSlideTemplate(html: string, css: string, title: string): string {
    return `<html><title>${title}</title><style>${css}</style><body>${html}</body></html>`;
  }
}

describe('ServerController', () => {
  let controller: ServerController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    controller = new ServerController(
      new MockFileService(),
      new MockPathResolver(),
      new MockDirectoryTreeBuilder(),
      new MockMarkdownRenderer(),
      new MockMarpRenderer(),
      '/base'
    );

    statusMock = jest.fn().mockReturnThis();
    sendMock = jest.fn();
    jsonMock = jest.fn();

    mockRes = {
      status: statusMock,
      send: sendMock,
      json: jsonMock,
      setHeader: jest.fn(),
      sendFile: jest.fn()
    };

    mockReq = {
      params: {}
    };
  });

  describe('handleIndex', () => {
    it('should render file list', async () => {
      // Given
      const recursive = false;

      // When
      await controller.handleIndex(mockReq as Request, mockRes as Response, recursive);

      // Then
      expect(sendMock).toHaveBeenCalled();
      const html = sendMock.mock.calls[0][0];
      expect(html).toContain('file1.md');
      expect(html).toContain('file2.html');
      expect(html).toContain('<title>');
    });
  });

  describe('handleViewFile', () => {
    it('should render markdown file', async () => {
      // Given
      mockReq.params = { filename: 'test.md' };

      // When
      await controller.handleViewFile(mockReq as Request, mockRes as Response);

      // Then
      expect(sendMock).toHaveBeenCalled();
      const html = sendMock.mock.calls[0][0];
      expect(html).toContain('<h1>Rendered</h1>');
    });

    it('should render Marp presentation', async () => {
      // Given
      mockReq.params = { filename: 'marp.md' };

      // When
      await controller.handleViewFile(mockReq as Request, mockRes as Response);

      // Then
      expect(sendMock).toHaveBeenCalled();
      const html = sendMock.mock.calls[0][0];
      expect(html).toContain('<section>Slide 1</section>');
    });

    it('should handle file not found', async () => {
      // Given
      mockReq.params = { filename: 'notfound.md' };

      // When
      await controller.handleViewFile(mockReq as Request, mockRes as Response);

      // Then
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('File not found');
    });

    it('should handle unsafe paths', async () => {
      // Given
      mockReq.params = { filename: '../etc/passwd' };

      // When
      await controller.handleViewFile(mockReq as Request, mockRes as Response);

      // Then
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid file path');
    });

    it('should handle non-markdown/html files', async () => {
      // Given
      mockReq.params = { filename: 'test.txt' };

      // When
      await controller.handleViewFile(mockReq as Request, mockRes as Response);

      // Then
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid file type');
    });
  });

  describe('handleRawHtml', () => {
    it('should serve raw HTML file', async () => {
      // Given
      mockReq.params = { filename: 'test.html' };
      const mockFileService = controller['fileService'] as MockFileService;
      jest.spyOn(mockFileService, 'readFile').mockResolvedValue('<html>Test</html>');

      // When
      await controller.handleRawHtml(mockReq as Request, mockRes as Response);

      // Then
      expect(sendMock).toHaveBeenCalled();
      const sentContent = sendMock.mock.calls[0][0];
      expect(sentContent).toContain('Test</html>');
    });

    it('should reject non-HTML files', async () => {
      // Given
      mockReq.params = { filename: 'test.md' };

      // When
      await controller.handleRawHtml(mockReq as Request, mockRes as Response);

      // Then
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Only HTML files are allowed');
    });
  });

  describe('error handling', () => {
    it('should handle read errors gracefully', async () => {
      // Given
      mockReq.params = { filename: 'test.md' };
      const mockFileService = controller['fileService'] as MockFileService;
      jest.spyOn(mockFileService, 'readFile').mockRejectedValue(new Error('Read error'));

      // When
      await controller.handleViewFile(mockReq as Request, mockRes as Response);

      // Then
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('Error: Read error');
    });
  });
});