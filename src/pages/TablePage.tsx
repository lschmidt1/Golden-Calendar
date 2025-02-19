import React, { useState, useCallback, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, Moon, Sun, Search } from 'lucide-react';
import { SpreadsheetData, SortDirection } from '../types';
import { exportToCsv } from '../utils';
import { mockData, generateMockRows, generateSingleRow } from '../data';
import { useTheme } from '../context/ThemeContext';
import { MuiButton } from '../components/common/MuiButton'
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@mui/material';
import { LogOut } from 'lucide-react';
import { Tabs, Tab, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderGroup {
  title: string;
  columns: string[];
}

interface GroupedHeaders {
  [key: string]: HeaderGroup;
}

export default function TablePage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { username } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);

  const generalHeaders = [
    'Year', 'GBU', 'SQUAD', 'Franchise', 'Brand Family', 'Brand', 
    'Platform (optional)', 'NPI', 'Customer', 'Calendar Type', 
    'Activation', 'Activation Type', 'Placement', 'Tactic Detail',
    'Status', 'Start Date', 'End Date'
  ];

  const mentalAvailabilityHeaders = {
    media: {
      title: 'Media',
      columns: ['MA_Media_GTS', 'MA_Media_Investment']
    },
    consumerPromotions: {
      title: 'Consumer Promotions',
      columns: ['MA_CP_GTS', 'MA_CP_Investment', 'MA_CP_Quantity']
    },
    hcp: {
      title: 'HCP',
      columns: ['MA_HCP_Sales Force Reach', 'MA_HCP_Non Personal Reach', 'MA_HCP_Investment']
    },
    nationalSampling: {
      title: 'National Sampling',
      columns: ['MA_NS_Quantity']
    }
  };

  const physicalAvailabilityHeaders = {
    displays: {
      title: 'Displays',
      columns: ['PA_Display_GTS', 'PA_Display_Quantity']
    },
    pricePromotion: {
      title: 'Price Promotion',
      columns: ['PA_PP_GTS']
    },
    shopperMarket: {
      title: 'Shopper Market',
      columns: ['PA_SM_GTS']
    },
    retailerSampling: {
      title: 'Retailer Sampling',
      columns: ['PA_RS_Quantity']
    }
  };

  const [data, setData] = useState<SpreadsheetData>(() => {
    return {
      headers: generalHeaders,
      rows: generateMockRows()
    };
  });

  const [allSelected, setAllSelected] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ column: number; direction: SortDirection } | null>(null);
  const [searchColumn, setSearchColumn] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [resizing, setResizing] = useState<{ index: number; startX: number } | null>(null);

  const GENERAL_COLUMNS_END = 17;  // Last index of General tab columns
  const MENTAL_COLUMNS_START = GENERAL_COLUMNS_END;
  const MENTAL_COLUMNS_END = MENTAL_COLUMNS_START + 8;  // 8 columns for Mental Availability
  const PHYSICAL_COLUMNS_START = MENTAL_COLUMNS_END;
  const PHYSICAL_COLUMNS_END = PHYSICAL_COLUMNS_START + 5;  // 5 columns for Physical Availability

  const [newRowId, setNewRowId] = useState<string | null>(null);

  const getHeadersArray = (headers: string[] | GroupedHeaders): string[] => {
    if (!headers) return [];
    if (Array.isArray(headers)) {
      return headers;
    }
    return Object.values(headers).flatMap(group => group.columns || []);
  };
  
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
  
    const calculateInitialColumnWidths = useCallback(() => {
      const headers = getHeadersArray(data.headers);
      const widths = Array(headers.length).fill(100);
      
      // Check header widths
      headers.forEach((header, index) => {
        const headerWidth = calculateTextWidth(header);
        widths[index] = Math.max(widths[index], headerWidth);
      });
      
      // Check all row content widths
      data.rows.forEach(row => {
        row.cells.forEach((cell, index) => {
          if (cell) { // Only check non-empty cells
            const cellWidth = calculateTextWidth(cell);
            widths[index] = Math.max(widths[index], cellWidth);
          }
        });
      });
  
      // Check dropdown options widths (only for General tab)
      if (activeTab === 0) {
        Object.values(mockData).forEach((options, index) => {
          if (Array.isArray(options)) {
            options.forEach(option => {
              const columnIndex = index + 1;
              if (columnIndex < headers.length - 2) {
                const optionWidth = calculateTextWidth(option);
                widths[columnIndex] = Math.max(widths[columnIndex], optionWidth);
              }
            });
          }
        });
      }
      
      // Add extra padding and ensure minimum width
      return widths.map((width, index) => {
        // Add extra space for dropdown columns (only for General tab)
        const hasDropdown = activeTab === 0 && index > 0 && index < headers.length - 2;
        const extraPadding = hasDropdown ? 32 : 16; // Increased padding
        
        // Add extra space for first column (checkbox)
        const isFirstColumn = index === 0;
        const firstColumnPadding = isFirstColumn ? 24 : 0;
        
        // Ensure minimum width and add padding
        return Math.max(120, width + extraPadding + firstColumnPadding);
      });
    }, [data.headers, activeTab]);
  
    const [columnWidths, setColumnWidths] = useState<number[]>(() => calculateInitialColumnWidths());
  
    useEffect(() => {
      const newWidths = calculateInitialColumnWidths();
      setColumnWidths(newWidths);
    }, [activeTab, calculateInitialColumnWidths]);
  
    const handleCellChange = (rowId: string, cellIndex: number, value: string) => {
      const rowIndex = data.rows.findIndex(row => row.id === rowId);
      if (rowIndex === -1) return;

      const newRows = [...data.rows];
      const actualCellIndex = 
        activeTab === 0 ? cellIndex : 
        activeTab === 1 ? MENTAL_COLUMNS_START + cellIndex :
        PHYSICAL_COLUMNS_START + cellIndex;

      newRows[rowIndex] = {
        ...newRows[rowIndex],
        cells: newRows[rowIndex].cells.map((cell, i) => 
          i === actualCellIndex ? value : cell
        ),
      };
      setData({ ...data, rows: newRows });
    };
  
    const addRow = () => {
      const newRow = generateSingleRow();
      setNewRowId(newRow.id);
      setData(prevData => ({
        ...prevData,
        rows: [newRow, ...prevData.rows]
      }));

      setTimeout(() => {
        setNewRowId(null);
      }, 5000);
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
  
    const toggleRowSelection = (rowId: string) => {
      const newRows = data.rows.map(row => 
        row.id === rowId ? { ...row, selected: !row.selected } : row
      );
      setData({ ...data, rows: newRows });
      setAllSelected(newRows.every(row => row.selected));
    };

  
    // Add this helper function to calculate group offset
    const getGroupOffset = (group: HeaderGroup, headers: GroupedHeaders) => {
      let offset = 0;
      for (const key in headers) {
        if (headers[key] === group) {
          break;
        }
        offset += headers[key].columns.length;
      }
      return offset;
    };

    // Update the getActualColumnIndex function
    const getActualColumnIndex = (visibleIndex: number, group?: HeaderGroup) => {
      if (activeTab === 0) {
        return visibleIndex;
      }

      // For Mental and Physical Availability tabs
      const baseIndex = activeTab === 1 ? MENTAL_COLUMNS_START : PHYSICAL_COLUMNS_START;
      
      if (!group) {
        return baseIndex + visibleIndex;
      }

      // Calculate offset within the current tab based on group position
      const headers = data.headers as GroupedHeaders;
      const groupOffset = getGroupOffset(group, headers);
      
      return baseIndex + groupOffset + visibleIndex;
    };

    // Update the handleSort function
    const handleSort = (columnIndex: number, group?: HeaderGroup) => {
      const actualColumnIndex = getActualColumnIndex(columnIndex, group);

      let direction: SortDirection = 'asc';
      
      if (sortConfig && sortConfig.column === actualColumnIndex) {
        if (sortConfig.direction === 'asc') {
          direction = 'desc';
        } else {
          setSortConfig(null);
          return;
        }
      }
  
      setSortConfig({ column: actualColumnIndex, direction });
      
      const sortedRows = [...data.rows].sort((a, b) => {
        const aValue = a.cells[actualColumnIndex];
        const bValue = b.cells[actualColumnIndex];
        
        if (direction === 'asc') {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      });
  
      setData({ ...data, rows: sortedRows });
    };
  
    // Update the handleSearch function
    const handleSearch = (columnIndex: number, group?: HeaderGroup) => {
      const actualColumnIndex = getActualColumnIndex(columnIndex, group);

      if (searchColumn === actualColumnIndex) {
        setSearchColumn(null);
        setSearchTerm('');
      } else {
        setSearchColumn(actualColumnIndex);
        setSearchTerm('');
      }
    };
  
    const filteredRows = data.rows.filter(row => {
      if (!searchTerm || searchColumn === null) return true;
      return row.cells[searchColumn].toLowerCase().includes(searchTerm.toLowerCase());
    });
  
    const startResizing = useCallback((index: number, e: React.MouseEvent, group?: HeaderGroup) => {
      let actualIndex = index;
      
      if (activeTab !== 0 && group) {
        const headers = data.headers as GroupedHeaders;
        let columnCount = 0;
        
        for (const key in headers) {
          if (headers[key] === group) {
            actualIndex = columnCount + index;
            break;
          }
          columnCount += headers[key].columns.length;
        }
      }
      
      setResizing({ index: actualIndex, startX: e.clientX });
    }, [activeTab, data.headers]);
  
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
  
    const handleLogout = () => {
      navigate('/login');
    };
  
    const handleTabChange = async (event: React.SyntheticEvent, newValue: number) => {
      // Reset sort and search when changing tabs
      setSortConfig(null);
      setSearchColumn(null);
      setSearchTerm('');
      setActiveTab(newValue);
    };
  
    // Update the useEffect that handles tab changes to only change the headers, not the rows
    useEffect(() => {
      let headers;
      switch (activeTab) {
        case 0:
          headers = generalHeaders;
          break;
        case 1:
          headers = mentalAvailabilityHeaders;
          break;
        case 2:
          headers = physicalAvailabilityHeaders;
          break;
        default:
          headers = generalHeaders;
      }
      
      // Only update the headers, keep the same rows
      setData(prevData => ({
        ...prevData,
        headers
      }));
    }, [activeTab]);
  
    return (
      <div className={`overflow-hidden min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className="w-full bg-secondary py-2 shadow-md">
          <div className="w-full mx-auto flex justify-between items-center px-4">
            <img src="/images/kenvue-logo.png" alt="Kenvue" className="h-9" />
            <div className="flex items-center gap-4">
              <Avatar sx={{ 
                bgcolor: 'white', 
                color: '#0288d1',
                width: 32, 
                height: 32 
              }}>
                {username.charAt(0).toUpperCase()}
              </Avatar>
              <span className={`text-white font-medium`}>{username}</span>
              <MuiButton
                label="Logout"
                onClick={handleLogout}
                startIcon={<LogOut size={18} />}
                color="inherit"
                sx={{ 
                  marginLeft: '3rem',
                  color: '#0288d1',
                  bgcolor: 'white',
                  '&:hover': {
                    bgcolor: 'white',
                    opacity: 0.9
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div 
          className={` ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
          onMouseMove={handleResize}
          onMouseUp={stopResizing}
          onMouseLeave={stopResizing}
        >
          <div className="mx-auto px-4 py-8">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
              {/* Header with buttons */}
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Golden Calendar
                    </h1>
                    <MuiButton
                      label="Add Row"
                      onClick={addRow}
                      startIcon={<Plus size={18} />}
                      color="primary"
                    />
                    <MuiButton
                      label="Delete Selected"
                      onClick={removeSelectedRows}
                      startIcon={<Trash2 size={18} />}
                      color="error"
                    />
                    <MuiButton
                      label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                      onClick={toggleDarkMode}
                      startIcon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                      color="secondary"
                    />
                  </div>
                  <div className="flex gap-4">
                    <MuiButton
                      label="Export"
                      onClick={() => exportToCsv(data)}
                      startIcon={<Download size={18} />}
                      color="info"
                      disabled
                    />
                    <MuiButton
                      label="Import"
                      component="label"
                      startIcon={<Upload size={18} />}
                      color="success"
                      disabled
                    >
                      <input
                        type="file"
                        accept=".csv"
                        hidden
                      />
                    </MuiButton>
                  </div>
                </div>
              </div>

              {/* Move Tabs here */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      color: isDarkMode ? '#fff' : '#000',
                      '&.Mui-selected': {
                        color: '#0288d1',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#0288d1',
                    },
                  }}
                >
                  <Tab label="General" />
                  <Tab label="Mental Availability" />
                  <Tab label="Physical Availability" />
                </Tabs>
              </Box>

              {/* Single table with different columns based on activeTab */}
              <div className="overflow-x-auto scrollbar-visible" 
                style={{ 
                  width: '100%',
                  overflowX: 'scroll',
                  overflowY: 'visible',
                  WebkitOverflowScrolling: 'touch',
                  height: 'calc(100vh - 220px)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    style={{ 
                      minWidth: 'fit-content',
                      width: 'max-content',
                      flex: '1 0 auto'
                    }}
                  >
                    <table style={{ 
                      borderCollapse: 'separate',
                      borderSpacing: '2px 0',
                      position: 'relative'
                    }}>
                      <thead>
                        {activeTab === 0 ? (
                          // Original header rendering for General tab
                          <tr className={isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'}>
                            <th 
                              className={`sticky left-0 z-20 px-4 py-3 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'}`}
                              style={{ 
                                borderRight: `2px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                                backgroundColor: isDarkMode ? '#312E81' : '#EEF2FF',
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
                            {getHeadersArray(data.headers).map((header, index) => (
                              <th
                                key={index}
                                className={`${index < 3 ? `sticky left-${index === 0 ? '12' : index === 1 ? '32' : '52'} z-10` : ''} 
                                  ${isDarkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'}
                                  cursor-pointer group relative`}
                                style={{ 
                                  width: `${columnWidths[index]}px`,
                                  borderRight: `2px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                                  backgroundColor: isDarkMode ? '#312E81' : '#EEF2FF',
                                  position: 'relative',
                                  padding: '0',
                                }}
                              >
                                <div className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap h-full">
                                  <div className="flex items-center gap-2">
                                    <span onClick={() => handleSort(index)}>{header}</span>
                                    {sortConfig?.column === (
                                      activeTab === 0 ? index : 
                                      activeTab === 1 ? index + MENTAL_COLUMNS_START : 
                                      index + PHYSICAL_COLUMNS_START
                                    ) && (
                                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                    <button
                                      className="opacity-50 hover:opacity-100"
                                      onClick={(e) => { e.stopPropagation(); handleSearch(index); }}
                                    >
                                      <Search size={16} />
                                    </button>
                                  </div>
                                  {searchColumn === (
                                    activeTab === 0 ? index : 
                                    activeTab === 1 ? index + MENTAL_COLUMNS_START : 
                                    index + PHYSICAL_COLUMNS_START
                                  ) && (
                                    <input
                                      type="text"
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className={`mt-2 w-full px-2 py-1 rounded-md 
                                        ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                </div>
                                <div
                                  className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors"
                                  onMouseDown={(e) => startResizing(index, e, undefined)}
                                  style={{
                                    transform: 'translateX(1px)',
                                  }}
                                />
                              </th>
                            ))}
                          </tr>
                        ) : (
                          // Group header rendering for Mental and Physical Availability tabs
                          <>
                            <tr className={isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'}>
                              <th 
                                className={`sticky left-0 z-20 px-4 py-3 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'}`}
                                style={{ 
                                  borderRight: `2px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                                  backgroundColor: isDarkMode ? '#312E81' : '#EEF2FF',
                                  position: 'relative',
                                  padding: '0',
                                }}
                                rowSpan={2}
                              >
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={toggleSelectAll}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                              </th>
                              {Object.values(activeTab === 0 ? { general: { title: 'General', columns: data.headers as string[] } } : data.headers as GroupedHeaders).map((group: HeaderGroup) => (
                                <th
                                  key={group.title || 'general'}
                                  colSpan={Array.isArray(group.columns) ? group.columns.length : 1}
                                  className={`${isDarkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'} 
                                    text-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                                  style={{
                                    backgroundColor: isDarkMode ? '#312E81' : '#EEF2FF',
                                    padding: '0.75rem',
                                  }}
                                >
                                  {group.title || ''}
                                </th>
                              ))}
                            </tr>
                            <tr className={isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'}>
                              {Object.values(data.headers as GroupedHeaders).map((group: HeaderGroup) => 
                                (group.columns || []).map((column: string, columnIndex: number) => (
                                  <th
                                    key={column}
                                    className={`${isDarkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'} 
                                      cursor-pointer group relative`}
                                    style={{ 
                                      width: `${columnWidths[columnIndex]}px`,
                                      borderRight: `2px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                                      backgroundColor: isDarkMode ? '#312E81' : '#EEF2FF',
                                      position: 'relative',
                                      padding: '0.75rem',
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span onClick={() => handleSort(columnIndex, group)}>{column}</span>
                                      {sortConfig?.column === getActualColumnIndex(columnIndex, group) && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                      )}
                                      <button
                                        className="opacity-50 hover:opacity-100"
                                        onClick={() => handleSearch(columnIndex, group)}
                                      >
                                        <Search size={16} />
                                      </button>
                                    </div>
                                    {searchColumn === getActualColumnIndex(columnIndex, group) && (
                                      <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`mt-2 w-full px-2 py-1 rounded-md 
                                          ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    )}
                                    <div
                                      className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors"
                                      onMouseDown={(e) => startResizing(columnIndex, e, group)}
                                      style={{
                                        transform: 'translateX(1px)',
                                      }}
                                    />
                                  </th>
                                ))
                              )}
                            </tr>
                          </>
                        )}
                      </thead>
                      <tbody>
                        {filteredRows.map((row) => (
                          <tr 
                            key={row.id} 
                            className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                              ${row.id === newRowId ? 'bg-blue-50 dark:bg-blue-900/30' : ''} 
                              transition-colors duration-500`}
                          >
                            <td className={`sticky left-0 z-10 px-4 py-4 
                              ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                              ${row.id === newRowId ? '!bg-blue-50 dark:!bg-blue-900/30' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={row.selected}
                                onChange={() => toggleRowSelection(row.id)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                            </td>
                            {row.cells.slice(
                              activeTab === 0 ? 0 : 
                              activeTab === 1 ? MENTAL_COLUMNS_START : 
                              PHYSICAL_COLUMNS_START,
                              activeTab === 0 ? GENERAL_COLUMNS_END :
                              activeTab === 1 ? MENTAL_COLUMNS_END :
                              PHYSICAL_COLUMNS_END
                            ).map((cell, cellIndex) => {
                              const isFixedColumn = activeTab === 0 && cellIndex < 3;
                              const isDateColumn = activeTab === 0 && cellIndex >= getHeadersArray(data.headers).length - 2;
                              const hasDropdown = activeTab === 0 && cellIndex > 0 && cellIndex < getHeadersArray(data.headers).length - 3;
                              const dropdownOptions = hasDropdown ? 
                                Object.values(mockData)[cellIndex - 1] || [] : [];
                
                              return (
                                <td
                                  key={`${row.id}-${cellIndex}`}
                                  className={`${isFixedColumn ? `sticky left-${cellIndex === 0 ? '12' : cellIndex === 1 ? '32' : '52'} z-10` : ''} 
                                    px-6 py-4 
                                    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                                    ${row.id === newRowId ? '!bg-blue-50 dark:!bg-blue-900/30' : ''}`}
                                  style={{ width: `${columnWidths[cellIndex]}px` }}
                                >
                                  {hasDropdown ? (
                                    <select
                                      ref={row.id === newRowId && cellIndex === 0 ? (el) => el?.focus() : undefined}
                                      value={cell}
                                      onChange={(e) => handleCellChange(row.id, cellIndex, e.target.value)}
                                      className={`w-full border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded-md
                                        ${isDarkMode ? 'text-white [&>option]:bg-gray-800' : 'text-gray-900 [&>option]:bg-white'}`}
                                    >
                                      <option value="" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>Select...</option>
                                      {dropdownOptions.map((option: string, optIndex: number) => (
                                        <option 
                                          key={`${row.id}-${cellIndex}-${optIndex}`} 
                                          value={option}
                                          className={isDarkMode ? 'bg-gray-800' : 'bg-white'}
                                        >
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      ref={row.id === newRowId && cellIndex === 0 ? (el) => el?.focus() : undefined}
                                      type={isDateColumn ? 'date' : 'text'}
                                      value={cell}
                                      onChange={(e) => handleCellChange(row.id, cellIndex, e.target.value)}
                                      className={`w-full border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded-md
                                        ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                    />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } 