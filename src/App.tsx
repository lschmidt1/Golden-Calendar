import React, { useState, useCallback, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, Moon, Sun, Search } from 'lucide-react';
import { SpreadsheetData, Row, SortDirection } from './types';
import { exportToCsv, /* parseCSV */ } from './utils';
import { mockData, generateMockRows } from './data';

const calculateTextWidth = (text: string): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 120;
  
  // Use the same font as your table
  context.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const metrics = context.measureText(text);
  
  // Add more generous base padding
  return Math.ceil(metrics.width * 1.1) + 64; // 10% extra width plus 64px padding
};

function App() {
  const [data, setData] = useState<SpreadsheetData>({
    headers: [
      'Year', 'GBU', 'SQUAD', 'Franchise', 'Brand Family', 'Brand', 
      'Platform (optional)', 'NPT', 'Customer', 'Calendar Type', 
      'Activation', 'Activation Type', 'Placement', 'Tactic Detail',
      'Status', 'Start Date', 'End Date'
    ],
    rows: generateMockRows(),
  });

  const [allSelected, setAllSelected] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ column: number; direction: SortDirection } | null>(null);
  const [searchColumn, setSearchColumn] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [resizing, setResizing] = useState<{ index: number; startX: number } | null>(null);

  const calculateInitialColumnWidths = useCallback(() => {
    const widths = Array(data.headers.length).fill(100);
    
    // Check header widths
    data.headers.forEach((header, index) => {
      const headerWidth = calculateTextWidth(header);
      widths[index] = Math.max(widths[index], headerWidth);
    });
    
    // Check all row content widths
    data.rows.forEach(row => {
      row.cells.forEach((cell, index) => {
        if (cell) { // Only check non-empty cells
          const cellWidth = calculateTextWidth(cell);
          widths[index] = Math.max(widths[index], cellWidth );
        }
      });
    });

    // Check dropdown options widths
    Object.values(mockData).forEach((options, index) => {
      if (Array.isArray(options)) {
        options.forEach(option => {
          const columnIndex = index + 1;
          if (columnIndex < data.headers.length - 2) {
            const optionWidth = calculateTextWidth(option);
            widths[columnIndex] = Math.max(widths[columnIndex], optionWidth);
          }
        });
      }
    });
    
    // Add extra padding and ensure minimum width
    return widths.map((width, index) => {
      // Add extra space for dropdown columns
      const hasDropdown = index > 0 && index < data.headers.length - 2;
      const extraPadding = hasDropdown ? 32 : 16; // Increased padding
      
      // Add extra space for first column (checkbox)
      const isFirstColumn = index === 0;
      const firstColumnPadding = isFirstColumn ? 24 : 0;
      
      // Ensure minimum width and add padding
      return Math.max(120, width + extraPadding + firstColumnPadding);
    });
  }, [data.headers, data.rows]);

  const [columnWidths, setColumnWidths] = useState<number[]>(() => calculateInitialColumnWidths());

  useEffect(() => {
    setColumnWidths(calculateInitialColumnWidths());
  }, [data, calculateInitialColumnWidths]);

  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    const newRows = [...data.rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      cells: newRows[rowIndex].cells.map((cell, i) => (i === cellIndex ? value : cell)),
    };
    setData({ ...data, rows: newRows });
  };

  const addRow = () => {
    const newRow: Row = {
      id: String(Date.now()),
      selected: false,
      cells: Array(data.headers.length).fill(''),
    };
    setData({ ...data, rows: [newRow, ...data.rows] });
  };

  const removeSelectedRows = () => {
    const newRows = data.rows.filter(row => !row.selected);
    setData({ ...data, rows: newRows });
    setAllSelected(false);
  };

 /*  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsedData = parseCSV(text);
        setData(parsedData);
      };
      reader.readAsText(file);
    }
  }; */

  const toggleSelectAll = () => {
    const newSelected = !allSelected;
    setAllSelected(newSelected);
    setData({
      ...data,
      rows: data.rows.map(row => ({ ...row, selected: newSelected }))
    });
  };

  const toggleRowSelection = (rowIndex: number) => {
    const newRows = [...data.rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      selected: !newRows[rowIndex].selected
    };
    setData({ ...data, rows: newRows });
    setAllSelected(newRows.every(row => row.selected));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSort = (columnIndex: number) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig && sortConfig.column === columnIndex) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else {
        setSortConfig(null);
        return;
      }
    }

    setSortConfig({ column: columnIndex, direction });
    
    const sortedRows = [...data.rows].sort((a, b) => {
      const aValue = a.cells[columnIndex];
      const bValue = b.cells[columnIndex];
      
      if (direction === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });

    setData({ ...data, rows: sortedRows });
  };

  const handleSearch = (columnIndex: number) => {
    if (searchColumn === columnIndex) {
      setSearchColumn(null);
      setSearchTerm('');
    } else {
      setSearchColumn(columnIndex);
      setSearchTerm('');
    }
  };

  const filteredRows = data.rows.filter(row => {
    if (!searchTerm || searchColumn === null) return true;
    return row.cells[searchColumn].toLowerCase().includes(searchTerm.toLowerCase());
  });

  const startResizing = useCallback((index: number, startX: number) => {
    setResizing({ index, startX });
  }, []);

  const stopResizing = useCallback(() => {
    setResizing(null);
  }, []);

  const handleResize = useCallback((e: React.MouseEvent) => {
    if (!resizing) return;

    e.preventDefault();
    const diff = e.clientX - resizing.startX;
    const newWidths = [...columnWidths];
    const newWidth = Math.max(100, columnWidths[resizing.index] + diff);
    newWidths[resizing.index] = newWidth;
    setColumnWidths(newWidths);
    setResizing({ ...resizing, startX: e.clientX });
  }, [resizing, columnWidths]);

  return (
    <div 
      className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
      onMouseMove={handleResize}
      onMouseUp={stopResizing}
      onMouseLeave={stopResizing}
    >
      <div className="container mx-auto px-4 py-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          {/* Header */}
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Golden Calendar
                </h1>
                <button
                  onClick={addRow}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={18} />
                  Add Row
                </button>
                <button
                  onClick={removeSelectedRows}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                  Delete Selected
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => exportToCsv(data)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download size={18} />
                  Export
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                  <Upload size={18} />
                  Import
                  <input
                    type="file"
                    accept=".csv"
                    /* onChange={handleFileImport} */
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Spreadsheet */}
          <div className="overflow-x-auto" 
            style={{ 
              width: '100%',
              overflowX: 'scroll',
              overflowY: 'visible',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div style={{ 
              minWidth: 'fit-content',
              width: 'max-content'
            }}>
              <table style={{ 
                borderCollapse: 'separate',
                borderSpacing: '2px 0',
                position: 'relative'
              }}>
                <thead>
                  <tr className={darkMode ? 'bg-indigo-900' : 'bg-indigo-100'}>
                    <th 
                      className={`sticky left-0 z-20 px-4 py-3 ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'}`}
                      style={{ 
                        borderRight: `2px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
                        backgroundColor: darkMode ? '#312E81' : '#EEF2FF',
                        position: 'relative',
                        padding: '0',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    {/* Fixed Columns */}
                    {data.headers.slice(0, 3).map((header, index) => (
                      <th
                        key={index}
                        className={`sticky left-${index === 0 ? '12' : index === 1 ? '32' : '52'} z-10 
                          ${darkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'}
                          cursor-pointer group relative`}
                        style={{ 
                          width: `${columnWidths[index]}px`,
                          borderRight: `2px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
                          backgroundColor: darkMode ? '#312E81' : '#EEF2FF',
                          position: 'relative',
                          padding: '0',
                        }}
                      >
                        <div className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap h-full">
                          <div className="flex items-center gap-2">
                            <span onClick={() => handleSort(index)}>{header}</span>
                            {sortConfig?.column === index && (
                              <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                            <button
                              className="opacity-50 hover:opacity-100"
                              onClick={() => handleSearch(index)}
                            >
                              <Search size={16} />
                            </button>
                          </div>
                          {searchColumn === index && (
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className={`mt-2 w-full px-2 py-1 rounded-md 
                                ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                        <div
                          className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors"
                          onMouseDown={(e) => startResizing(index, e.clientX)}
                          style={{
                            transform: 'translateX(1px)',
                          }}
                        />
                      </th>
                    ))}
                    {/* Scrollable Columns */}
                    {data.headers.slice(3).map((header, index) => (
                      <th
                        key={index + 3}
                        className={`${darkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'} 
                          cursor-pointer group relative`}
                        style={{ 
                          width: `${columnWidths[index + 3]}px`,
                          borderRight: `2px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
                          backgroundColor: darkMode ? '#312E81' : '#EEF2FF',
                          position: 'relative',
                          padding: '0',
                        }}
                      >
                        <div className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap h-full">
                          <div className="flex items-center gap-2">
                            <span onClick={() => handleSort(index + 3)}>{header}</span>
                            {sortConfig?.column === index + 3 && (
                              <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                            <button
                              className="opacity-50 hover:opacity-100"
                              onClick={() => handleSearch(index + 3)}
                            >
                              <Search size={16} />
                            </button>
                          </div>
                          {searchColumn === index + 3 && (
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className={`mt-2 w-full px-2 py-1 rounded-md 
                                ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                        <div
                          className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors"
                          onMouseDown={(e) => startResizing(index + 3, e.clientX)}
                          style={{
                            transform: 'translateX(1px)',
                          }}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rowIndex) => (
                    <tr key={row.id} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`sticky left-0 z-10 px-4 py-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRowSelection(rowIndex)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      {row.cells.map((cell, cellIndex) => {
                        const isFixedColumn = cellIndex < 3;
                        const isDateColumn = cellIndex >= data.headers.length - 2;
                        const hasDropdown = cellIndex > 0 && cellIndex < data.headers.length - 3;
                        const dropdownOptions = hasDropdown ? 
                          Object.values(mockData)[cellIndex - 1] || [] : [];

                        return (
                          <td
                            key={cellIndex}
                            className={`${isFixedColumn ? `sticky left-${cellIndex === 0 ? '12' : cellIndex === 1 ? '32' : '52'} z-10` : ''} 
                              px-6 py-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                            style={{ width: `${columnWidths[cellIndex]}px` }}
                          >
                            {hasDropdown ? (
                              <select
                                value={cell}
                                onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                                className={`w-full border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded-md
                                  ${darkMode ? 'text-white' : 'text-gray-900'}`}
                              >
                                <option value="">Select...</option>
                                {dropdownOptions.map((option: string) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={isDateColumn ? 'date' : 'text'}
                                value={cell}
                                onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                                className={`w-full border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded-md
                                  ${darkMode ? 'text-white' : 'text-gray-900'}`}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;