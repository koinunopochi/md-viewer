import { FileNavigation, NavigationFile } from '../../domain/entities/FileNavigation';

export class NavigationTemplate {
  static generate(navigation: FileNavigation): string {
    return `
      <div class="file-navigation">
        <div class="nav-main">
          ${this.renderPreviousNext(navigation)}
        </div>
        
        ${this.renderRelatedFiles(navigation)}
      </div>
    `;
  }

  private static renderPreviousNext(navigation: FileNavigation): string {
    const prevLink = navigation.previous 
      ? `<a href="/view/${encodeURIComponent(navigation.previous.path)}" class="nav-prev">
          <span class="nav-arrow">←</span>
          <span class="nav-text">
            <span class="nav-label">Previous</span>
            <span class="nav-filename">${this.getIcon(navigation.previous.type)} ${navigation.previous.name}</span>
          </span>
        </a>`
      : '<div class="nav-prev nav-disabled"></div>';

    const nextLink = navigation.next
      ? `<a href="/view/${encodeURIComponent(navigation.next.path)}" class="nav-next">
          <span class="nav-text">
            <span class="nav-label">Next</span>
            <span class="nav-filename">${this.getIcon(navigation.next.type)} ${navigation.next.name}</span>
          </span>
          <span class="nav-arrow">→</span>
        </a>`
      : '<div class="nav-next nav-disabled"></div>';

    return `
      <div class="nav-prev-next">
        ${prevLink}
        ${nextLink}
      </div>
    `;
  }

  private static renderRelatedFiles(navigation: FileNavigation): string {
    let sections = [];

    // Parent directory
    if (navigation.parent) {
      sections.push(`
        <div class="nav-section">
          <h4 class="nav-section-title">📁 Parent Directory</h4>
          <div class="nav-links">
            ${this.renderFileLink(navigation.parent)}
          </div>
        </div>
      `);
    }

    // Child directories
    if (navigation.children.length > 0) {
      sections.push(`
        <div class="nav-section">
          <h4 class="nav-section-title">📂 Subdirectories</h4>
          <div class="nav-links">
            ${navigation.children.map(file => this.renderFileLink(file)).join('')}
          </div>
        </div>
      `);
    }

    // Siblings (limit to 5 before and 5 after current position)
    if (navigation.siblings.length > 0) {
      const displaySiblings = navigation.siblings.slice(0, 10);
      sections.push(`
        <div class="nav-section">
          <h4 class="nav-section-title">📄 Same Directory</h4>
          <div class="nav-links">
            ${displaySiblings.map(file => this.renderFileLink(file)).join('')}
            ${navigation.siblings.length > 10 ? '<span class="nav-more">...</span>' : ''}
          </div>
        </div>
      `);
    }

    return sections.length > 0 
      ? `<div class="nav-related">${sections.join('')}</div>`
      : '';
  }

  private static renderFileLink(file: NavigationFile): string {
    return `
      <a href="/view/${encodeURIComponent(file.path)}" class="nav-file-link">
        ${this.getIcon(file.type)} ${file.name}
      </a>
    `;
  }

  private static getIcon(type: 'markdown' | 'html' | 'csv' | 'image'): string {
    switch (type) {
      case 'markdown': return '📝';
      case 'html': return '🌐';
      case 'csv': return '📊';
      case 'image': return '🖼️';
      default: return '📄';
    }
  }
}