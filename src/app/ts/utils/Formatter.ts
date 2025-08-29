export class Formatter {
  static parseMarkdown = (text: string): string => {
    const parseTable = (tableText: string): string => {
      const lines = tableText.trim().split('\n').filter(line => line.trim());
      if (lines.length < 3) return tableText;
      
      let separatorIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^\s*\|?[\s\-\|:]+\|?\s*$/)) {
          separatorIndex = i;
          break;
        }
      }
      
      if (separatorIndex === -1 || separatorIndex === 0) {
        return tableText;
      }
      
      const headerLine = lines[separatorIndex - 1];
      const separatorLine = lines[separatorIndex];
      const dataLines = lines.slice(separatorIndex + 1);
      
      const splitTableRow = (line: string): string[] => {
        const cells: string[] = [];
        let current = '';
        let inCode = false;
        let escaped = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (escaped) {
            current += char;
            escaped = false;
            continue;
          }
          
          if (char === '\\') {
            escaped = true;
            current += char;
            continue;
          }
          
          if (char === '`') {
            inCode = !inCode;
            current += char;
            continue;
          }
          
          if (char === '|' && !inCode) {
            if (current.trim() || cells.length > 0) {
              cells.push(current.trim());
              current = '';
            }
          } else {
            current += char;
          }
        }
        
        if (current.trim()) {
          cells.push(current.trim());
        }
        
        return cells.filter(cell => cell !== '');
      };
      
      const headers = splitTableRow(headerLine);
      if (headers.length === 0) return tableText;
      
      const alignments = separatorLine.split('|').map(sep => {
        const trimmed = sep.trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
        if (trimmed.endsWith(':')) return 'right';
        return 'left';
      }).filter((_, i) => i < headers.length);
      
      let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse border border-ui-border-primary rounded-lg">';
      
      tableHtml += '<thead class="bg-ui-bg-secondary/50"><tr>';
      headers.forEach((header, i) => {
        const align = alignments[i] || 'left';
        const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
        const processedHeader = header
          .replace(/`([^`]+)`/g, '<code class="bg-ui-bg-primary px-1 py-0.5 rounded text-xs">$1</code>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        tableHtml += `<th class="border border-ui-border-primary px-3 py-2 ${alignClass} font-semibold text-sm text-ui-text-primary">${processedHeader}</th>`;
      });
      tableHtml += '</tr></thead>';
      
      tableHtml += '<tbody>';
      dataLines.forEach((line, rowIndex) => {
        const cells = splitTableRow(line);
        if (cells.length > 0) {
          const rowClass = rowIndex % 2 === 0 ? 'bg-ui-bg-primary' : 'bg-ui-bg-secondary/20';
          tableHtml += `<tr class="${rowClass} hover:bg-ui-bg-secondary/40 transition-colors">`;
          
          for (let i = 0; i < headers.length; i++) {
            const cell = cells[i] || '';
            const align = alignments[i] || 'left';
            const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
            
            let processedCell = cell
              .replace(/`([^`]+)`/g, '<code class="bg-ui-bg-secondary px-1 py-0.5 rounded text-xs font-mono">$1</code>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\\n/g, '<br>')
              .replace(/\n/g, '<br>');
            
            if (processedCell.length > 50 && processedCell.includes('\\')) {
              processedCell = `<div class="max-w-xs overflow-hidden text-ellipsis" title="${cell}">${processedCell}</div>`;
            }
            
            tableHtml += `<td class="border border-ui-border-primary px-3 py-2 ${alignClass} text-sm text-ui-text-primary">${processedCell}</td>`;
          }
          tableHtml += '</tr>';
        }
      });
      tableHtml += '</tbody></table></div>';
      
      return tableHtml;
    };
    
    const tableRegex = /^(\s*\|[^\n]*\n)+\s*\|[\s\-\|:]+\|\s*\n(\s*\|[^\n]*\n?)+/gm;
    
    return text
      .replace(tableRegex, (match) => {
        return parseTable(match);
      })
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold mb-2 mt-4 first:mt-0">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mb-2 mt-4 first:mt-0">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-3 mt-4 first:mt-0">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/__(.*?)__/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      .replace(/_(.*?)_/gim, '<em class="italic">$1</em>')
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-ui-bg-secondary p-3 rounded-lg border border-ui-border-primary/50 overflow-x-auto my-3"><code class="text-sm font-mono whitespace-pre">$2</code></pre>')
      .replace(/`([^`\n]+)`/gim, '<code class="bg-ui-bg-secondary px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^\* (.+)$/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^- (.+)$/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^\d+\. (.+)$/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>')
      .replace(/\n\n/gim, '</p><p class="mb-3">')
      .replace(/\n/gim, '<br />');
  };
}