import { CliOptions } from '../../domain/entities/CliOptions';
import * as path from 'path';

export class CliParser {
  private defaultExcludePatterns: RegExp[] = [
    /node_modules/,
    /\.git/,
    /\.next/,
    /dist/,
    /build/,
    /coverage/,
    /\.cache/,
    /\.vscode/,
    /\.idea/
  ];

  parse(args: string[]): CliOptions {
    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
      this.showHelp();
      process.exit(0);
    }

    // Check for version flag
    if (args.includes('--version') || args.includes('-v')) {
      this.showVersion();
      process.exit(0);
    }
    const processedArgs = args.slice(2); // Remove 'node' and script name
    let targetDir = process.cwd();
    let recursive = false;
    const excludePatterns: RegExp[] = [];

    // Parse directory path
    for (let i = 0; i < processedArgs.length; i++) {
      if (!processedArgs[i].startsWith('-')) {
        targetDir = path.resolve(processedArgs[i]);
        break;
      }
    }

    // Parse recursive option
    recursive = processedArgs.includes('--recursive') || processedArgs.includes('-r');

    // Parse exclude patterns
    const excludeIndex = processedArgs.findIndex(arg => arg === '--exclude' || arg === '-e');
    if (excludeIndex !== -1 && processedArgs[excludeIndex + 1]) {
      const patterns = processedArgs[excludeIndex + 1].split(',');
      patterns.forEach(pattern => {
        try {
          excludePatterns.push(new RegExp(pattern));
        } catch (e) {
          console.error(`⚠️  無効な正規表現: ${pattern}`);
        }
      });
    }

    return {
      targetDir,
      recursive,
      excludePatterns: [...this.defaultExcludePatterns, ...excludePatterns]
    };
  }

  private showHelp(): void {
    console.log(`
🐾 Pika - Lightning-fast document viewer

USAGE:
  pika [directory] [options]

OPTIONS:
  -r, --recursive         Include subdirectories
  -e, --exclude <patterns>  Comma-separated regex patterns to exclude
  -h, --help             Show this help message
  -v, --version          Show version number

EXAMPLES:
  pika                   View current directory
  pika ./docs -r         View docs recursively
  pika . -r -e "test"    Exclude test files

DEFAULT EXCLUSIONS:
  node_modules, .git, .next, dist, build, coverage, .cache, .vscode, .idea

For more information, visit: https://github.com/koinunopochi/pika
    `.trim());
  }

  private showVersion(): void {
    const packageJson = require('../../../package.json');
    console.log(`Pika v${packageJson.version}`);
  }
}