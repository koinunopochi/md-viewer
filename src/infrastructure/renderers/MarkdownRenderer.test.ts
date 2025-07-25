import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  let renderer: MarkdownRenderer;

  beforeEach(() => {
    renderer = new MarkdownRenderer();
  });

  describe('render', () => {
    it('should convert basic markdown to HTML', () => {
      // Given
      const markdown = '# Hello World\n\nThis is a paragraph.';

      // When
      const html = renderer.render(markdown);

      // Then
      expect(html).toContain('<h1');
      expect(html).toContain('Hello World');
      expect(html).toContain('<p');
      expect(html).toContain('This is a paragraph.');
    });

    it('should handle code blocks', () => {
      // Given
      const markdown = '```javascript\nconsole.log("Hello");\n```';

      // When
      const html = renderer.render(markdown);

      // Then
      expect(html).toContain('<pre');
      expect(html).toContain('<code');
      expect(html).toContain('console');
    });

    it('should handle lists', () => {
      // Given
      const markdown = '- Item 1\n- Item 2\n- Item 3';

      // When
      const html = renderer.render(markdown);

      // Then
      expect(html).toContain('<ul');
      expect(html).toContain('<li');
      expect(html).toContain('Item 1');
    });

    it('should handle links', () => {
      // Given
      const markdown = '[Google](https://google.com)';

      // When
      const html = renderer.render(markdown);

      // Then
      expect(html).toContain('<a');
      expect(html).toContain('href="https://google.com"');
      expect(html).toContain('Google');
    });

    it('should handle images', () => {
      // Given
      const markdown = '![Alt text](image.png)';

      // When
      const html = renderer.render(markdown);

      // Then
      expect(html).toContain('<img');
      expect(html).toContain('src="image.png"');
      expect(html).toContain('alt="Alt text"');
    });
  });

  describe('isMarpDocument', () => {
    it('should return true for Marp documents', () => {
      // Given
      const marpMarkdown = '---\nmarp: true\n---\n# Slide';

      // When
      const isMarp = renderer.isMarpDocument(marpMarkdown);

      // Then
      expect(isMarp).toBe(true);
    });

    it('should return false for regular markdown', () => {
      // Given
      const regularMarkdown = '# Regular Document';

      // When
      const isMarp = renderer.isMarpDocument(regularMarkdown);

      // Then
      expect(isMarp).toBe(false);
    });

    it('should return false for invalid frontmatter', () => {
      // Given
      const invalidFrontmatter = '---\ninvalid yaml\n---\n# Document';

      // When
      const isMarp = renderer.isMarpDocument(invalidFrontmatter);

      // Then
      expect(isMarp).toBe(false);
    });
  });

  describe('processImages', () => {
    it('should convert relative image paths to absolute paths', () => {
      // Given
      const markdown = '![Image](./images/photo.png)';
      const baseUrl = '/docs';

      // When
      const processed = renderer.processImages(markdown, baseUrl);

      // Then
      expect(processed).toContain('/docs/images/photo.png');
    });

    it('should not modify absolute URLs', () => {
      // Given
      const markdown = '![Image](https://example.com/image.png)';
      const baseUrl = '/docs';

      // When
      const processed = renderer.processImages(markdown, baseUrl);

      // Then
      expect(processed).toContain('https://example.com/image.png');
    });

    it('should handle multiple images', () => {
      // Given
      const markdown = '![First](./img1.png) and ![Second](./img2.png)';
      const baseUrl = '/docs';

      // When
      const processed = renderer.processImages(markdown, baseUrl);

      // Then
      expect(processed).toContain('/docs/img1.png');
      expect(processed).toContain('/docs/img2.png');
    });
  });
});