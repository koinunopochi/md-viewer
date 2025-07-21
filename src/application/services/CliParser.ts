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
}