export class Formatter {
  static parseMarkdown = (text: string): string => {
    const parseTable = (tableText: string): string => {
      const lines = tableText.trim().split('\n');
      if (lines.length < 3) return tableText;
      
      const headerLine = lines[0];
      const separatorLine = lines[1];
      const dataLines = lines.slice(2);
      
      if (!separatorLine.match(/^\|?[\s\-\|:]+\|?$/)) {
        return tableText;
      }
      
      const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
      
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
        tableHtml += `<th class="border border-ui-border-primary px-3 py-2 text-${align} font-semibold text-sm text-ui-text-primary">${header}</th>`;
      });
      tableHtml += '</tr></thead>';
      
      tableHtml += '<tbody>';
      dataLines.forEach((line, rowIndex) => {
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length > 0) {
          const rowClass = rowIndex % 2 === 0 ? 'bg-ui-bg-primary' : 'bg-ui-bg-secondary/20';
          tableHtml += `<tr class="${rowClass} hover:bg-ui-bg-secondary/40 transition-colors">`;
          cells.forEach((cell, i) => {
            const align = alignments[i] || 'left';
            tableHtml += `<td class="border border-ui-border-primary px-3 py-2 text-${align} text-sm text-ui-text-primary">${cell}</td>`;
          });
          for (let i = cells.length; i < headers.length; i++) {
            const align = alignments[i] || 'left';
            tableHtml += `<td class="border border-ui-border-primary px-3 py-2 text-${align} text-sm text-ui-text-primary"></td>`;
          }
          tableHtml += '</tr>';
        }
      });
      tableHtml += '</tbody></table></div>';
      
      return tableHtml;
    };
    
    return text
      .replace(/((?:\|.+\|[\r\n]+)+\|[\s\-\|:]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/gm, (match) => {
        return parseTable(match);
      })
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold mb-2 mt-4 first:mt-0">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mb-2 mt-4 first:mt-0">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-3 mt-4 first:mt-0">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/__(.*?)__/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      .replace(/_(.*?)_/gim, '<em class="italic">$1</em>')
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-ui-bg-secondary p-3 rounded-lg border border-ui-border-primary/50 overflow-x-auto my-3"><code class="text-sm font-mono whitespace-pre">$2</code></pre>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^\* (.+)$/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^- (.+)$/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^\d+\. (.+)$/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>')
      .replace(/\n\n/gim, '</p><p class="mb-3">')
      .replace(/\n/gim, '<br />');
  };
}