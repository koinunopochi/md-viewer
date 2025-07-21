import { MarpRenderer } from './MarpRenderer';

describe('MarpRenderer', () => {
  let renderer: MarpRenderer;

  beforeEach(() => {
    renderer = new MarpRenderer();
  });

  describe('render', () => {
    it('should render basic Marp presentation', () => {
      // Given
      const marpMarkdown = '---\nmarp: true\n---\n# Slide 1\n\n---\n\n# Slide 2';

      // When
      const result = renderer.render(marpMarkdown);

      // Then
      expect(result.html).toContain('section');
      expect(result.css).toBeDefined();
      expect(result.html).toContain('Slide 1');
      expect(result.html).toContain('Slide 2');
    });

    it('should handle Marp theme option', () => {
      // Given
      const marpMarkdown = '---\nmarp: true\ntheme: gaia\n---\n# Title';

      // When
      const result = renderer.render(marpMarkdown);

      // Then
      expect(result.html).toContain('section');
      expect(result.css).toContain('theme');
    });

    it('should render Marp with background image', () => {
      // Given
      const marpMarkdown = '---\nmarp: true\n---\n<!-- _backgroundImage: url("bg.jpg") -->\n# Slide';

      // When
      const result = renderer.render(marpMarkdown);

      // Then
      expect(result.html).toContain('section');
      // Marp processes background directives
    });

    it('should handle multiple slides', () => {
      // Given
      const marpMarkdown = `---
marp: true
---

# First Slide

Content here

---

# Second Slide

More content

---

# Third Slide

Final content`;

      // When
      const result = renderer.render(marpMarkdown);

      // Then
      expect(result.html).toContain('First Slide');
      expect(result.html).toContain('Second Slide');
      expect(result.html).toContain('Third Slide');
    });
  });

  describe('countSlides', () => {
    it('should count slides correctly', () => {
      // Given
      const html = '<section>1</section><section>2</section><section>3</section>';

      // When
      const count = renderer.countSlides(html);

      // Then
      expect(count).toBe(3);
    });

    it('should return 0 for empty HTML', () => {
      // Given
      const html = '';

      // When
      const count = renderer.countSlides(html);

      // Then
      expect(count).toBe(0);
    });

    it('should handle HTML with no sections', () => {
      // Given
      const html = '<div>No slides here</div>';

      // When
      const count = renderer.countSlides(html);

      // Then
      expect(count).toBe(0);
    });
  });

  describe('wrapInSlideTemplate', () => {
    it('should wrap content in slide navigation template', () => {
      // Given
      const html = '<section>Slide</section>';
      const css = 'body { color: black; }';
      const title = 'My Presentation';

      // When
      const wrapped = renderer.wrapInSlideTemplate(html, css, title);

      // Then
      expect(wrapped).toContain(title);
      expect(wrapped).toContain(html);
      expect(wrapped).toContain(css);
      expect(wrapped).toContain('slide-navigation');
      expect(wrapped).toContain('prevSlide');
      expect(wrapped).toContain('nextSlide');
    });

    it('should include keyboard navigation script', () => {
      // Given
      const html = '<section>Content</section>';
      const css = '';
      const title = 'Test';

      // When
      const wrapped = renderer.wrapInSlideTemplate(html, css, title);

      // Then
      expect(wrapped).toContain('addEventListener');
      expect(wrapped).toContain('ArrowLeft');
      expect(wrapped).toContain('ArrowRight');
    });
  });
});