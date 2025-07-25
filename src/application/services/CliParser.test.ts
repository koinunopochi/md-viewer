import { CliParser } from './CliParser';
import * as path from 'path';

describe('CliParser', () => {
  let parser: CliParser;
  const originalCwd = process.cwd();
  const originalExit = process.exit;
  const originalLog = console.log;

  beforeEach(() => {
    parser = new CliParser();
    process.exit = jest.fn() as any;
    console.log = jest.fn();
  });

  afterEach(() => {
    process.exit = originalExit;
    console.log = originalLog;
  });

  describe('parse', () => {
    it('should parse directory path', () => {
      // Given
      const args = ['node', 'script.js', '/test/directory'];

      // When
      const options = parser.parse(args);

      // Then
      expect(options.targetDir).toBe(path.resolve('/test/directory'));
      expect(options.recursive).toBe(false);
    });

    it('should default to current directory when no path provided', () => {
      // Given
      const args = ['node', 'script.js'];

      // When
      const options = parser.parse(args);

      // Then
      expect(options.targetDir).toBe(process.cwd());
    });

    it('should parse recursive flag with --recursive', () => {
      // Given
      const args = ['node', 'script.js', '--recursive'];

      // When
      const options = parser.parse(args);

      // Then
      expect(options.recursive).toBe(true);
    });

    it('should parse recursive flag with -r', () => {
      // Given
      const args = ['node', 'script.js', '-r'];

      // When
      const options = parser.parse(args);

      // Then
      expect(options.recursive).toBe(true);
    });

    it('should parse exclude patterns', () => {
      // Given
      const args = ['node', 'script.js', '--exclude', 'test.*,__tests__'];

      // When
      const options = parser.parse(args);

      // Then
      const customPatterns = options.excludePatterns.filter(p => 
        p.source === 'test.*' || p.source === '__tests__'
      );
      expect(customPatterns).toHaveLength(2);
    });

    it('should include default exclude patterns', () => {
      // Given
      const args = ['node', 'script.js'];

      // When
      const options = parser.parse(args);

      // Then
      const nodeModulesPattern = options.excludePatterns.find(p => p.source === 'node_modules');
      expect(nodeModulesPattern).toBeDefined();
    });

    it('should handle invalid regex patterns gracefully', () => {
      // Given
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const args = ['node', 'script.js', '--exclude', '[invalid'];

      // When
      const options = parser.parse(args);

      // Then
      expect(consoleSpy).toHaveBeenCalledWith('⚠️  無効な正規表現: [invalid');
      consoleSpy.mockRestore();
    });

    it('should parse all options together', () => {
      // Given
      const args = ['node', 'script.js', '/my/path', '--recursive', '--exclude', 'test.*'];

      // When
      const options = parser.parse(args);

      // Then
      expect(options.targetDir).toBe(path.resolve('/my/path'));
      expect(options.recursive).toBe(true);
      expect(options.excludePatterns.some(p => p.source === 'test.*')).toBe(true);
    });

    it('should show help when --help flag is used', () => {
      // Given
      const args = ['node', 'script.js', '--help'];

      // When
      parser.parse(args);

      // Then
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Pika - Lightning-fast document viewer'));
    });

    it('should show help when -h flag is used', () => {
      // Given
      const args = ['node', 'script.js', '-h'];

      // When
      parser.parse(args);

      // Then
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Pika - Lightning-fast document viewer'));
    });

    it('should show version when --version flag is used', () => {
      // Given
      const args = ['node', 'script.js', '--version'];

      // When
      parser.parse(args);

      // Then
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Pika v'));
    });

    it('should show version when -v flag is used', () => {
      // Given
      const args = ['node', 'script.js', '-v'];

      // When
      parser.parse(args);

      // Then
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Pika v'));
    });
  });
});