import { ICsvRenderer } from '../../domain/interfaces/ICsvRenderer';
import { parse } from 'csv-parse/sync';

export class CsvRenderer implements ICsvRenderer {
  render(csvContent: string): string {
    if (!csvContent.trim()) {
      return '<p>Empty CSV file</p>';
    }

    try {
      // Parse CSV with csv-parse library
      const rows = parse(csvContent, {
        columns: false,
        skip_empty_lines: false,
        relax_quotes: true,
        escape: '"',
        trim: false
      }) as string[][];
      
      if (rows.length === 0) {
        return '<p>No data to display</p>';
      }
      
      // Generate HTML with both table and raw views
      return `
        <div class="csv-container">
          <div class="csv-view-toggle">
            <button class="csv-toggle-btn active" data-view="table">
              <span class="icon">📊</span> Table View
            </button>
            <button class="csv-toggle-btn" data-view="raw">
              <span class="icon">📄</span> Raw CSV
            </button>
          </div>
          
          <div class="csv-view csv-table-view active">
            ${this.renderTable(rows)}
          </div>
          
          <div class="csv-view csv-raw-view">
            <pre class="csv-raw-content">${this.escapeHtml(csvContent)}</pre>
          </div>
        </div>
        
        <script>
          // CSV view toggle functionality
          document.addEventListener('DOMContentLoaded', function() {
            const toggleBtns = document.querySelectorAll('.csv-toggle-btn');
            const views = document.querySelectorAll('.csv-view');
            
            toggleBtns.forEach(btn => {
              btn.addEventListener('click', function() {
                const targetView = this.getAttribute('data-view');
                
                // Update buttons
                toggleBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update views
                views.forEach(v => v.classList.remove('active'));
                document.querySelector('.csv-' + targetView + '-view').classList.add('active');
              });
            });
          });
        </script>
      `;
    } catch (error) {
      return `
        <div class="csv-container">
          <div class="csv-error">
            <h3>⚠️ CSV Parse Error</h3>
            <p>The file could not be parsed as valid CSV.</p>
            <details>
              <summary>Error details</summary>
              <pre>${this.escapeHtml((error as Error).message)}</pre>
            </details>
            <h4>Raw content:</h4>
            <pre class="csv-raw-content">${this.escapeHtml(csvContent)}</pre>
          </div>
        </div>
      `;
    }
  }


  private renderTable(rows: string[][]): string {
    if (rows.length === 0) {
      return '<p>No data to display</p>';
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    let html = '<div class="csv-table-wrapper"><table class="csv-table">';
    
    // Header
    html += '<thead><tr>';
    headers.forEach(header => {
      html += `<th>${this.escapeHtml(header)}</th>`;
    });
    html += '</tr></thead>';
    
    // Body
    html += '<tbody>';
    dataRows.forEach((row, index) => {
      html += `<tr class="${index % 2 === 0 ? 'even' : 'odd'}">`;
      row.forEach((cell, cellIndex) => {
        // Handle cells with newlines
        const cellContent = this.escapeHtml(cell).replace(/\n/g, '<br>');
        html += `<td>${cellContent}</td>`;
      });
      // Fill empty cells if row is shorter than header
      for (let i = row.length; i < headers.length; i++) {
        html += '<td></td>';
      }
      html += '</tr>';
    });
    html += '</tbody>';
    
    html += '</table></div>';
    
    // Add row count
    html += `<div class="csv-info">Total rows: ${dataRows.length}</div>`;
    
    return html;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}