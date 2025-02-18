export interface Row {
  id: string;
  selected: boolean;
  cells: string[];
}

export interface SpreadsheetData {
  headers: string[];
  rows: Row[];
}

export type SortDirection = 'asc' | 'desc';