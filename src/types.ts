export interface Row {
  id: string;
  selected: boolean;
  cells: string[];
}

export interface SpreadsheetData {
  headers: string[] | GroupedHeaders;
  rows: Row[];
}

export interface HeaderGroup {
  title: string;
  columns: string[];
}

export interface GroupedHeaders {
  [key: string]: HeaderGroup;
}

export type SortDirection = 'asc' | 'desc';