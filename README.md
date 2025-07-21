# Pika 🐾

A fast document viewer for Markdown, HTML, and more - peek at your files like a pika!

## Features

- 📝 View Markdown files with beautiful GitHub-style rendering
- 🌐 Display HTML files with iframe embedding
- 📊 Direct Mermaid diagram rendering (no iframe)
- 🎨 Marp presentation support
- 📁 Recursive directory browsing
- 🔍 File filtering with exclude patterns
- 💬 Chat format conversion support

## Installation

### Using npx (Recommended)

```bash
npx @koinunopochi/pika [directory] [options]
```

### Global Installation

```bash
npm install -g @koinunopochi/pika
pika [directory] [options]
```

### Local Development

```bash
git clone https://github.com/koinunopochi/pika.git
cd pika
npm install
npm start
```

## Usage

### Basic Usage

```bash
# View files in current directory
npx @koinunopochi/pika

# View files in specific directory
npx @koinunopochi/pika /path/to/directory

# Recursive search
npx @koinunopochi/pika /path/to/directory --recursive
npx @koinunopochi/pika . -r
```

### Advanced Options

```bash
# Exclude patterns (regex)
npx @koinunopochi/pika . --recursive --exclude "test.*,__tests__"
npx @koinunopochi/pika . -r -e "\.test\.,\.spec\."
```

### Examples

```bash
# View all Markdown files in current directory recursively
npx @koinunopochi/pika . --recursive

# View documentation excluding test files
npx @koinunopochi/pika ./docs --recursive --exclude "test,spec,__"

# View project root excluding common build directories
npx @koinunopochi/pika . -r
```

## Features in Detail

### Markdown Rendering
- Uses zenn-markdown-html for high-quality rendering
- GitHub-flavored Markdown support
- Syntax highlighting for code blocks
- Task lists, tables, and more

### Mermaid Diagrams
- Direct rendering without iframes
- Supports flowcharts, sequence diagrams, ER diagrams, etc.
- Auto-resizing and proper styling

### Marp Presentations
- Detects Marp-formatted Markdown files (with `marp: true` in frontmatter)
- Slide navigation with keyboard arrows
- Full-screen presentation mode

### HTML File Support
- Embeds HTML files in collapsible iframes
- Preserves relative paths for assets
- Seamless navigation within embedded content

### Directory Browsing
- Tree-view file listing
- Collapsible directories
- File count display
- Persistent collapse state

### Default Exclusions
The following directories are excluded by default:
- node_modules
- .git
- .next
- dist
- build
- coverage
- .cache
- .vscode
- .idea

## Server Details

- **Port**: 15559
- **Access**: http://localhost:15559
- **Stop**: Ctrl+C

## Version

Current version: 0.1.0

## License

MIT