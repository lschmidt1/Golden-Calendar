import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Download, Upload, Plus, Trash2, Moon, Sun, Search, X } from 'lucide-react';
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
import { useMediaQuery } from '@mui/material';

interface HeaderGroup {
  title: string;
  columns: string[];
}

interface GroupedHeaders {
  [key: string]: HeaderGroup;
}

const calculateTextWidth = (text: string): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 150;
  
  context.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const metrics = context.measureText(text);
  
  return Math.ceil(metrics.width) + 100;
};

// Clean up the resizingStyles constant
const resizingStyles = `
  .resize-handle {
    position: absolute;
    top: 0;
    right: 0;
    width: 10px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
    background-color: transparent;
  }
  
  .resize-handle:hover,
  .resize-handle:active {
    background-color: rgba(59, 130, 246, 0.5);
  }
`;

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

  const GENERAL_COLUMNS_END = 17;  // Last index of General tab columns
  const MENTAL_COLUMNS_START = GENERAL_COLUMNS_END;
  const MENTAL_COLUMNS_END = MENTAL_COLUMNS_START + 8;  // 8 columns for Mental Availability
  const PHYSICAL_COLUMNS_START = MENTAL_COLUMNS_END;

  const [newRowId, setNewRowId] = useState<string | null>(null);

  const generalRef = useRef<HTMLTableCellElement>(null);
  const mentalRef = useRef<HTMLTableCellElement>(null);
  const physicalRef = useRef<HTMLTableCellElement>(null);

  const [columnWidths, setColumnWidths] = useState<number[]>(() => {
    // Initialize widths for all columns
    const allHeaders = [
      ...generalHeaders,
      ...Object.values(mentalAvailabilityHeaders).flatMap(group => group.columns),
      ...Object.values(physicalAvailabilityHeaders).flatMap(group => group.columns)
    ];
    
    return allHeaders.map(header => calculateTextWidth(header));
  });

  const getHeadersArray = (headers: string[] | GroupedHeaders): string[] => {
    if (!headers) return [];
    if (Array.isArray(headers)) {
      return headers;
    }
    return Object.values(headers).flatMap(group => group.columns || []);
  };
  
    const calculateInitialColumnWidths = useCallback(() => {
    const headers = getHeadersArray(data.headers);
    // Start with a larger minimum width for all columns
    const widths = Array(headers.length).fill(200);
      
      // Check header widths
    headers.forEach((header, index) => {
        const headerWidth = calculateTextWidth(header);
        widths[index] = Math.max(widths[index], headerWidth);
      });
      
      // Check all row content widths with extra padding
      data.rows.forEach(row => {
        row.cells.forEach((cell, index) => {
          if (cell) { // Only check non-empty cells
            const cellWidth = calculateTextWidth(cell) + 40; // Add extra padding for cell content
            widths[index] = Math.max(widths[index], cellWidth);
          }
        });
      });
  
    // Special handling for known columns that need more space
    const specialColumns: Record<string, number> = {
      'SQUAD': 250,
      'Franchise': 250,
      'Brand Family': 250,
      'Brand': 250,
      'Customer': 250,
      'Activation': 250,
      'Activation Type': 250
    };
    
    // Apply special column widths
    headers.forEach((header, index) => {
      if (specialColumns[header as keyof typeof specialColumns]) {
        widths[index] = Math.max(widths[index], specialColumns[header as keyof typeof specialColumns]);
      }
    });
  
    // Check dropdown options widths with extra padding
    Object.values(mockData).forEach((options, index) => {
      if (Array.isArray(options)) {
        options.forEach(option => {
          const columnIndex = index + 1;
          if (columnIndex < generalHeaders.length - 2) {
            const optionWidth = calculateTextWidth(option) + 60; // More extra space for dropdown options
            widths[columnIndex] = Math.max(widths[columnIndex], optionWidth);
          }
        });
      }
    });
      
      // Add extra padding and ensure minimum width
      return widths.map((width, index) => {
      // Add extra space for dropdown columns
      const hasDropdown = index > 0 && index < generalHeaders.length - 2;
        const extraPadding = hasDropdown ? 60 : 40; // Increased padding
        
        // Add extra space for first column (checkbox)
        const isFirstColumn = index === 0;
        const firstColumnPadding = isFirstColumn ? 24 : 0;
        
        // Ensure minimum width and add padding
        return Math.max(200, width + extraPadding + firstColumnPadding);
      });
  }, [data.headers, data.rows, generalHeaders]);
  
    useEffect(() => {
    const newWidths = calculateInitialColumnWidths();
    setColumnWidths(newWidths);
  }, [calculateInitialColumnWidths]);

  // Add this useEffect to recalculate column widths after data is loaded
  useEffect(() => {
    // Wait for data to be fully loaded
    if (data.rows.length > 0) {
      // Force recalculation of column widths
      const newWidths = calculateInitialColumnWidths();
      
      // Apply minimum widths for specific columns
      const updatedWidths = [...newWidths];
      
      // Set minimum widths for specific columns by name
      const minColumnWidths: Record<string, number> = {
        'SQUAD': 300,
        'Franchise': 300,
        'Brand Family': 300,
        'Brand': 300,
        'Customer': 300,
        'Activation': 300,
        'Activation Type': 300
      };
      
      // Apply minimum widths
      generalHeaders.forEach((header, index) => {
        if (minColumnWidths[header]) {
          updatedWidths[index] = Math.max(updatedWidths[index], minColumnWidths[header]);
        }
      });
      
      setColumnWidths(updatedWidths);
    }
  }, [data.rows.length, calculateInitialColumnWidths, generalHeaders]);

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
    
    // Clear sort and search filters
    setSortConfig(null);
    setSearchColumn(null);
    setSearchTerm('');
    
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
  
  const toggleSelectAll = () => {
    const newRows = data.rows.map(row => {
      // If there's a search filter, only toggle rows that are in the filtered results
      if (searchTerm && searchColumn !== null) {
        const isInFilteredRows = filteredRows.some(filteredRow => filteredRow.id === row.id);
        return {
          ...row,
          selected: isInFilteredRows ? !allSelected : row.selected
        };
      }
      // If no filter, toggle all rows
      return {
        ...row,
        selected: !allSelected
      };
    });
    
    setData({ ...data, rows: newRows });
    setAllSelected(!allSelected);
  };

  const toggleRowSelection = (rowId: string) => {
    const newRows = data.rows.map(row => 
      row.id === rowId ? { ...row, selected: !row.selected } : row
    );
      setData({ ...data, rows: newRows });
      setAllSelected(newRows.every(row => row.selected));
    };

  const getGroupOffset = (group: HeaderGroup, headers: GroupedHeaders) => {
    if (!headers || !group) return 0;
    
    let offset = 0;
    for (const key in headers) {
      if (headers[key] === group) {
        break;
      }
      offset += headers[key].columns?.length || 0;
    }
    return offset;
  };

  const getActualColumnIndex = (visibleIndex: number, group?: HeaderGroup) => {
    if (activeTab === 0) {
      return visibleIndex;
    }

    const baseIndex = activeTab === 1 ? MENTAL_COLUMNS_START : PHYSICAL_COLUMNS_START;
    
    if (!group) {
      return baseIndex + visibleIndex;
    }

    // Get the correct headers based on activeTab
    const headers = activeTab === 1 ? mentalAvailabilityHeaders : physicalAvailabilityHeaders;
    const groupOffset = getGroupOffset(group, headers);
    
    return baseIndex + groupOffset + visibleIndex;
  };

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
    if (!searchTerm) return true;
    if (searchColumn !== null) {
      return row.cells[searchColumn].toLowerCase().includes(searchTerm.toLowerCase());
    }
    // Global search across all columns
    return row.cells.some(cell => 
      cell.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleLogout = () => {
    navigate('/login');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Get all table cells
    const cells = document.querySelectorAll('th');
    let targetCell;
    let scrollOffset = 0;

    if (newValue === 0) {
      // Scroll to Year column (first column after checkbox)
      targetCell = cells[1]; // Index 1 because index 0 is checkbox
      scrollOffset = -100; // Offset to show some of the previous columns
    } else if (newValue === 1) {
      // Scroll to MA_Media_GTS column
      targetCell = Array.from(cells).find(cell => cell.textContent?.includes('MA_Media_GTS'));
      scrollOffset = -50; // Smaller offset to show less of previous columns
    } else {
      // Scroll to PA_Display_GTS column
      targetCell = Array.from(cells).find(cell => cell.textContent?.includes('PA_Display_GTS'));
      scrollOffset = -150; // Larger offset to show more context
    }

    if (targetCell) {
      const container = document.querySelector('.overflow-x-auto');
      const cellRect = targetCell.getBoundingClientRect();
      const containerRect = container?.getBoundingClientRect();
      
      if (container && containerRect) {
        container.scrollLeft = container.scrollLeft + cellRect.left - containerRect.left + scrollOffset;
      }
    }
  };

  useEffect(() => {
    // Create a more responsive observer with lower threshold and larger margins
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Check if the element is at least partially visible
          if (entry.isIntersecting) {
            if (entry.target === generalRef.current) {
              setActiveTab(0);
            } else if (entry.target === mentalRef.current) {
              setActiveTab(1);
            } else if (entry.target === physicalRef.current) {
              setActiveTab(2);
            }
          }
        });
      },
      { 
        threshold: [0, 0.1, 0.2, 0.3], // Multiple thresholds for better detection
        rootMargin: "0px 200px 0px 200px" // Larger margins on both sides
      }
    );

    // Update the scroll handler to remove unused variable
    const handleScroll = () => {
      // Get the scroll position
      const scrollContainer = document.querySelector('.overflow-x-auto');
      if (!scrollContainer) return;
      
      const containerWidth = scrollContainer.clientWidth;
      
      // Get positions of section headers relative to the viewport
      const generalHeader = generalRef.current?.getBoundingClientRect();
      const mentalHeader = mentalRef.current?.getBoundingClientRect();
      const physicalHeader = physicalRef.current?.getBoundingClientRect();
      
      // Calculate visibility percentages for each section
      let generalVisibility = 0;
      let mentalVisibility = 0;
      let physicalVisibility = 0;
      
      if (generalHeader) {
        const visibleWidth = Math.min(generalHeader.right, containerWidth) - Math.max(generalHeader.left, 0);
        generalVisibility = Math.max(0, visibleWidth) / generalHeader.width;
      }
      
      if (mentalHeader) {
        const visibleWidth = Math.min(mentalHeader.right, containerWidth) - Math.max(mentalHeader.left, 0);
        mentalVisibility = Math.max(0, visibleWidth) / mentalHeader.width;
      }
      
      if (physicalHeader) {
        const visibleWidth = Math.min(physicalHeader.right, containerWidth) - Math.max(physicalHeader.left, 0);
        physicalVisibility = Math.max(0, visibleWidth) / physicalHeader.width;
      }
      
      // Set active tab based on which section has the highest visibility percentage
      if (generalVisibility > 0.1 && generalVisibility >= mentalVisibility && generalVisibility >= physicalVisibility) {
        setActiveTab(0);
      } else if (mentalVisibility > 0.1 && mentalVisibility >= generalVisibility && mentalVisibility >= physicalVisibility) {
        setActiveTab(1);
      } else if (physicalVisibility > 0.1 && physicalVisibility >= generalVisibility && physicalVisibility >= mentalVisibility) {
        setActiveTab(2);
      }
    };
    
    // Add scroll event listener with debounce
    const scrollContainer = document.querySelector('.overflow-x-auto');
    if (scrollContainer) {
      let timeout: number;
      scrollContainer.addEventListener('scroll', () => {
        clearTimeout(timeout);
        timeout = window.setTimeout(handleScroll, 100);
      });
    }

    // Observe the section headers
    if (generalRef.current) observer.observe(generalRef.current);
    if (mentalRef.current) observer.observe(mentalRef.current);
    if (physicalRef.current) observer.observe(physicalRef.current);

    return () => {
      observer.disconnect();
      const scrollContainer = document.querySelector('.overflow-x-auto');
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const clearFilters = () => {
    setSortConfig(null);
    setSearchColumn(null);
    setSearchTerm('');
  };

  const getAllHeaders = () => {
    return [
      ...generalHeaders,
      ...Object.values(mentalAvailabilityHeaders).flatMap(group => group.columns),
      ...Object.values(physicalAvailabilityHeaders).flatMap(group => group.columns)
    ];
    };
  
    useEffect(() => {
    // Wait for the DOM to be fully loaded
    setTimeout(() => {
      // Get all resize handles
      const handles = document.querySelectorAll('.resize-handle');
      
      // Add event listeners to each handle
      handles.forEach(handle => {
        handle.addEventListener('mousedown', onMouseDown);
      });
      
      // Mouse down handler
      function onMouseDown(e: Event) {
        e.preventDefault();
        
        // Get the parent th element
        const th = (e.target as HTMLElement).closest('th');
        if (!th) return;
        
        // Get initial width and position
        const startX = (e as MouseEvent).clientX;
        const startWidth = th.offsetWidth;
        
        // Add resize class to body
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        
        // Add document-level event listeners
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        // Mouse move handler
        function onMouseMove(e: MouseEvent) {
          // Calculate new width
          const newWidth = startWidth + (e.clientX - startX);
          if (newWidth < 50) return;
          
          // Set the new width directly
          if (th) {
            th.style.width = `${newWidth}px`;
            th.style.minWidth = `${newWidth}px`;
          }
        }
        
        // Mouse up handler
        function onMouseUp() {
          // Remove document-level event listeners
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          
          // Reset cursor and selection
          document.body.style.removeProperty('cursor');
          document.body.style.removeProperty('user-select');
        }
      }
    }, 500); // Shorter timeout is fine
  }, []);

  // Clean up the resize handler useEffect
  useEffect(() => {
    // Add the resizing styles to the document
    const styleElement = document.createElement('style');
    styleElement.innerHTML = resizingStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Update the column width calculation to be more general
  useEffect(() => {
    // Wait for the table to be fully rendered
    setTimeout(() => {
      // Get all table headers and rows
      const table = document.querySelector('table');
      if (!table) return;
      
      const headers = table.querySelectorAll('th:not(:first-child)'); // Skip checkbox column
      const rows = table.querySelectorAll('tbody tr');
      
      // For each column
      headers.forEach((header, index) => {
        // Skip the first column (checkbox)
        const columnIndex = index + 1;
        
        // Get all cells in this column
        const cells = Array.from(rows).map(row => 
          row.querySelector(`td:nth-child(${columnIndex + 1})`)
        );
        
        // Get header text to identify column type
        const headerText = header.textContent?.trim() || '';
        
        // Detect column types by patterns
        const isPercentage = /reach|percentage|%/i.test(headerText);
        const isQuantity = /quantity|qty|count|number/i.test(headerText);
        const isMonetary = /investment|amount|price|cost|value|\$/i.test(headerText);
        const isNumeric = isPercentage || isQuantity || isMonetary || /^\d+$/.test(headerText);
        
        // Set appropriate width based on column type
        let maxWidth = 0;
        
        // Check header width with minimal padding for numeric columns
        const headerWidth = calculateTextWidth(headerText) + (isNumeric ? 20 : 60);
        maxWidth = Math.max(maxWidth, headerWidth);
        
        // Check cell widths with minimal padding
        cells.forEach(cell => {
          if (!cell) return;
          
          const input = cell.querySelector('input, select');
          const cellText = input ? (input as HTMLInputElement).value : cell.textContent || '';
          
          // Check if cell content is numeric
          const isCellNumeric = isNumeric || /^[\d.,%$]+$/.test(cellText.trim());
          
          // Use very small padding for numeric/percentage columns
          const cellWidth = calculateTextWidth(cellText) + (isCellNumeric ? 10 : 40);
          maxWidth = Math.max(maxWidth, cellWidth);
        });
        
        // Set minimum width based on content type
        let minWidth = 200; // Default for text columns
        
        if (isPercentage) {
          minWidth = 60; // Smallest for percentages
        } else if (isQuantity) {
          minWidth = 80; // Small for quantities
        } else if (isMonetary) {
          minWidth = 100; // Medium for monetary values
        } else if (isNumeric) {
          minWidth = 80; // Small for other numeric columns
        }
        
        maxWidth = Math.max(maxWidth, minWidth);
        
        // Apply width directly to the header and all cells
        (header as HTMLElement).style.width = `${maxWidth}px`;
        (header as HTMLElement).style.minWidth = `${maxWidth}px`;
        
        cells.forEach(cell => {
          if (!cell) return;
          (cell as HTMLElement).style.width = `${maxWidth}px`;
          (cell as HTMLElement).style.minWidth = `${maxWidth}px`;
        });
      });
    }, 1000);
  }, [data.rows.length]); // Re-run when rows change

  return (
      <div className={`overflow-hidden min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header - Make it more compact on mobile */}
        <div className="w-full bg-secondary py-2 shadow-md">
        <div className="w-full mx-auto flex justify-between items-center px-4">
          <img src="/images/kenvue-logo.png" alt="Kenvue" className="h-8 ml-2 md:h-9 md:ml-5" />
          <div className="flex items-center gap-2 md:gap-4">
              <Avatar sx={{ 
                bgcolor: 'white',
                color: '#0288d1',
              width: isMobile ? 24 : 32, 
              height: isMobile ? 24 : 32 
              }}>
                {username.charAt(0).toUpperCase()}
              </Avatar>
            {!isMobile && <span className="text-white font-medium">{username}</span>}
              <MuiButton
              label={isMobile ? '' : "Logout"}
                onClick={handleLogout}
              startIcon={<LogOut size={isMobile ? 16 : 18} />}
                color="inherit"
                sx={{ 
                marginLeft: isMobile ? '1rem' : '3rem',
                marginRight: isMobile ? '1rem' : '3rem',
                minWidth: isMobile ? '40px' : 'auto',
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

      {isMobile ? (
        // Mobile view
        <div className={`h-[calc(100vh-120px)] flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Mobile Controls - Fixed at top */}
          <div className="p-4 bg-inherit">
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Golden Calendar
                </h1>
                <div className="flex items-center gap-2">
                  <MuiButton
                    label=""
                    onClick={() => exportToCsv(data)}
                    startIcon={<Download size={16} />}
                    color="inherit"
                    disabled={true}
                    sx={{ 
                      minWidth: '40px',
                      padding: '8px',
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'inherit',
                      opacity: isDarkMode ? 1 : 0.7,
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      }
                    }}
                  />
                  <MuiButton
                    label=""
                    onClick={() => {}}
                    startIcon={<Upload size={16} />}
                    color="inherit"
                    disabled={true}
                    sx={{ 
                      minWidth: '40px',
                      padding: '8px',
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'inherit',
                      opacity: isDarkMode ? 1 : 0.7,
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      }
                    }}
                  />
                  <MuiButton
                    label=""
                    onClick={toggleDarkMode}
                    startIcon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    color="secondary"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <MuiButton
                  label="Add"
                  onClick={addRow}
                  startIcon={<Plus size={16} />}
                  color="primary"
                  fullWidth
                />
                <MuiButton
                  label="Delete"
                  onClick={removeSelectedRows}
                  startIcon={<Trash2 size={16} />}
                  color="error"
                  fullWidth
                />
                <MuiButton
                  label="Clear"
                  onClick={clearFilters}
                  startIcon={<X size={16} />}
                  color="secondary"
                  disabled={!sortConfig && !searchTerm}
                  fullWidth
                />
              </div>
            </div>

            {/* Global Search Bar */}
            <div className={`relative mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Search 
                size={18} 
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchColumn(null); // Reset column-specific search
                }}
                placeholder="Search all..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Scrollable Cards Container */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRows.map((row) => (
                <div 
                  key={row.id}
                  className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 first:rounded-t-lg last:rounded-b-lg shadow
                    ${row.id === newRowId ? 'border-2 border-blue-500' : ''}
                    ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => toggleRowSelection(row.id)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ID: {row.id.slice(0, 8)}...
                    </span>
                  </div>

                  {/* Show all columns */}
                  {row.cells.map((cell, index) => {
                    const allHeaders = getAllHeaders();
                    const header = allHeaders[index];
                    const isDateColumn = index >= generalHeaders.length - 2 && index < generalHeaders.length;
                    const hasDropdown = index > 0 && index < generalHeaders.length - 2;
                    const dropdownOptions = hasDropdown ? Object.values(mockData)[index - 1] || [] : [];

                    return (
                      <div key={index} className="py-2">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {header}
                        </label>
                        {hasDropdown ? (
                          <select
                            value={cell}
                            onChange={(e) => handleCellChange(row.id, index, e.target.value)}
                            className={`mt-1 w-full px-3 py-2 rounded-md border ${
                              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                            }`}
                          >
                            <option value="">Select...</option>
                            {dropdownOptions.map((option: string) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={isDateColumn ? 'date' : 'text'}
                            value={cell}
                            onChange={(e) => handleCellChange(row.id, index, e.target.value)}
                            className={`mt-1 w-full px-3 py-2 rounded-md border ${
                              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Desktop view
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          {/* Controls - Above tabs */}
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                <h1 className={`text-xl font-bold mr-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
                  label="Clear Filters"
                  onClick={clearFilters}
                  startIcon={<X size={18} />}
                  color="secondary"
                  disabled={!sortConfig && !searchTerm}
                />
                <MuiButton
                  label="Dark Mode"
                      onClick={toggleDarkMode}
                      startIcon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                      color="secondary"
                    />
                  </div>
              <div className="flex items-center gap-4">
                    <MuiButton
                      label="Export"
                      onClick={() => exportToCsv(data)}
                      startIcon={<Download size={18} />}
                  color="inherit"
                  disabled={true}
                  sx={{ 
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'inherit',
                    opacity: isDarkMode ? 1 : 0.7,
                    cursor: 'not-allowed',
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }
                  }}
                    />
                    <MuiButton
                      label="Import"
                  onClick={() => {}}
                      startIcon={<Upload size={18} />}
                  color="inherit"
                  disabled={true}
                  sx={{ 
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'inherit',
                    opacity: isDarkMode ? 1 : 0.7,
                    cursor: 'not-allowed',
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }
                  }}
                />
                  </div>
                </div>
              </div>
    
          {/* Tabs */}
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'divider'
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'inherit',
                  '&.Mui-selected': {
                    color: isDarkMode ? 'white' : 'primary.main'
                  }
                }
              }}
            >
              <Tab label="General" />
              <Tab label="Mental Availability" />
              <Tab label="Physical Availability" />
            </Tabs>
          </Box>

          {/* Table container */}
              <div 
                className="overflow-x-auto scrollbar-visible" 
                style={{ 
                  width: '100%',
              overflowX: 'auto',
              height: 'calc(100vh - 220px)',
            }}
          >
                  <table style={{ 
                    borderCollapse: 'separate',
                    borderSpacing: '2px 0',
                    position: 'relative'
                  }}>
                    <thead>
                      <tr className={isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'}>
                  {/* Checkbox column */}
                        <th 
                          className={`sticky left-0 z-20 px-4 py-3 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'}`}
                    rowSpan={2}
                        >
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded"
                          />
                        </th>
                  
                  {/* Group headers */}
                  {/* General section */}
                  <th 
                    ref={generalRef}
                    colSpan={17} 
                    className={`${isDarkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'} text-center`}
                  >
                    General
                  </th>
                  
                  {/* Mental Availability groups */}
                  {Object.values(mentalAvailabilityHeaders).map((group) => (
                    <th
                      key={group.title}
                      ref={group.title === 'Media' ? mentalRef : undefined}
                      colSpan={group.columns.length}
                      className={`${isDarkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'} text-center`}
                    >
                      {group.title}
                    </th>
                  ))}
                  
                  {/* Physical Availability groups */}
                  {Object.values(physicalAvailabilityHeaders).map((group) => (
                    <th
                      key={group.title}
                      ref={group.title === 'Displays' ? physicalRef : undefined}
                      colSpan={group.columns.length}
                      className={`${isDarkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'} text-center`}
                    >
                      {group.title}
                    </th>
                  ))}
                </tr>

                {/* Column headers */}
                <tr className={`${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  {/* General headers */}
                  {generalHeaders.map((header, index) => (
                    <th
                      key={`general-${index}`}
                      className={`${isDarkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'} 
                        cursor-pointer group relative px-6 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
                      style={{ 
                        width: `${columnWidths[index]}px`,
                        borderRight: `2px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                      }}
                    >
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
                            ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="resize-handle" />
                    </th>
                  ))}

                  {/* Mental Availability columns */}
                  {Object.values(mentalAvailabilityHeaders).flatMap((group, groupIndex) => 
                    group.columns.map((column, columnIndex) => {
                      const mentalIndex = GENERAL_COLUMNS_END + groupIndex * group.columns.length + columnIndex;
                      return (
                        <th key={`mental-${column}`}
                            className={`${isDarkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'} 
                            cursor-pointer group relative px-6 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
                            style={{ 
                            width: `${columnWidths[mentalIndex]}px`,
                              borderRight: `2px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                            }}
                          >
                              <div className="flex items-center gap-2">
                            <span onClick={() => handleSort(mentalIndex)}>{column}</span>
                            {sortConfig?.column === mentalIndex && (
                                  <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                )}
                                <button
                                  className="opacity-50 hover:opacity-100"
                              onClick={() => handleSearch(mentalIndex)}
                                >
                                  <Search size={16} />
                                </button>
                              </div>
                          {searchColumn === mentalIndex && searchTerm && (
                                <input
                                  type="text"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className={`mt-2 w-full px-2 py-1 rounded-md 
                                    ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                          <div className="resize-handle" />
                        </th>
                      );
                    })
                  )}

                  {/* Physical Availability columns */}
                  {Object.values(physicalAvailabilityHeaders).flatMap((group, groupIndex) => 
                    group.columns.map((column, columnIndex) => {
                      const physicalIndex = PHYSICAL_COLUMNS_START + groupIndex * group.columns.length + columnIndex;
                      return (
                        <th key={`physical-${column}`}
                          className={`${isDarkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-gray-900'} 
                            cursor-pointer group relative px-6 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
                              style={{
                            width: `${columnWidths[physicalIndex]}px`,
                            borderRight: `2px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span onClick={() => handleSort(physicalIndex)}>{column}</span>
                            {sortConfig?.column === physicalIndex && (
                              <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                            <button
                              className="opacity-50 hover:opacity-100"
                              onClick={() => handleSearch(physicalIndex)}
                            >
                              <Search size={16} />
                            </button>
                          </div>
                          {searchColumn === physicalIndex && searchTerm && (
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className={`mt-2 w-full px-2 py-1 rounded-md 
                                ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <div className="resize-handle" />
                        </th>
                      );
                    })
                  )}
                      </tr>
                    </thead>
                    <tbody>
                {filteredRows.map((row) => (
                  <tr 
                    key={row.id}
                    className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                      ${row.id === newRowId ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                  >
                    <td className={`sticky left-0 z-10 px-4 py-4 
                      ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                      ${row.id === newRowId ? '!bg-blue-50 dark:!bg-blue-900/30' : ''}`}
                    >
                            <input
                              type="checkbox"
                              checked={row.selected}
                        onChange={() => toggleRowSelection(row.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                            />
                          </td>
                    {row.cells.map((cell, index) => {
                      const isDateColumn = index >= generalHeaders.length - 2 && index < generalHeaders.length;
                      const hasDropdown = index > 0 && index < generalHeaders.length - 2;
                      const dropdownOptions = hasDropdown ? Object.values(mockData)[index - 1] || [] : [];
    
                            return (
                              <td
                          key={`${row.id}-${index}`}
                          className={`px-6 py-4 
                            ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                            ${row.id === newRowId ? '!bg-blue-50 dark:!bg-blue-900/30' : ''}
                            border-x ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                          style={{ width: `${columnWidths[index]}px` }}
                              >
                                {hasDropdown ? (
                                  <select
                                    value={cell}
                              onChange={(e) => handleCellChange(row.id, index, e.target.value)}
                                    className={`w-full border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded-md
                                ${isDarkMode ? 'text-white [&>option]:bg-gray-800' : 'text-gray-900 [&>option]:bg-white'}`}
                                  >
                                    <option value="">Select...</option>
                                    {dropdownOptions.map((option: string) => (
                                <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type={isDateColumn ? 'date' : 'text'}
                                    value={cell}
                              onChange={(e) => handleCellChange(row.id, index, e.target.value)}
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
                </div>
              </div>
      )}
      </div>
    );
  } 