import { SpreadsheetData } from './types';

export function exportToCsv(data: SpreadsheetData) {
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => row.cells.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'spreadsheet.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(csvText: string): SpreadsheetData {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  const rows = lines.slice(1).map((line, index) => ({
    id: String(Date.now() + index),
    selected: false,
    cells: line.split(','),
  }));

  return {
    headers,
    rows,
  };
}