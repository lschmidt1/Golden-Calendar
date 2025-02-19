import { Row } from '../types';

// Helper function to generate a random number between min and max
export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to generate a random date within the last 2 years
const randomDate = () => {
  const end = new Date();
  const start = new Date(new Date().setFullYear(end.getFullYear() - 2));
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().split('T')[0];
};

// Helper function to generate random monetary value
const randomMonetaryValue = () => {
  return `$${(Math.random() * 1000000).toFixed(2)}`;
};

// Helper function to generate random percentage
const randomPercentage = () => {
  return `${randomInt(0, 100)}%`;
};

// Helper function to generate random quantity
const randomQuantity = () => {
  return randomInt(1000, 100000).toString();
};

// Add these mock data arrays for Mental and Physical Availability tabs
const franchises = [
  'TEHA', 'SKIN HEALTH & BEAUTY', 'SELF CARE', 'ALL'
];

const categories = [
  'SUN & MAKE UP', 'BODY CARE', 'BABY CARE', 'WOUND',
  'DIGESTIVE HEALTH', 'ORAL CARE', 'PAIN + COLD'
];

const brands = [
  'BABY CARE - VIVI & BLOOM', 'BODY CARE - NTG', 'CHILDRENS UPPER RESPIRATORY ALLERGY',
  'BODY CARE - AVEENO + LUBRIDERM', 'BABY CARE - AVEENO', 'ADULT ANALGESICS',
  'ADULT ALLERGY'
];

// Add UUID generation helper
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Remove count parameter since it's not needed anymore
export const generateMockRows = (): Row[] => {
  const rows: Row[] = [];

  // Default to generating 20 rows
  for (let i = 0; i < 20; i++) {
    // Generate all data upfront
    const year = randomDate().split('-')[0];
    const gbu = ['GBU1', 'GBU2', 'GBU3'][randomInt(0, 2)];
    const squad = ['Squad A', 'Squad B', 'Squad C'][randomInt(0, 2)];
    const franchise = franchises[randomInt(0, franchises.length - 1)];
    const category = categories[randomInt(0, categories.length - 1)];
    const brand = brands[randomInt(0, brands.length - 1)];

    // Create a complete row with all columns from all tabs
    const cells = [
      // General tab columns (0-16)
      year,
      gbu,
      squad,
      franchise,
      ['Brand Family A', 'Brand Family B'][randomInt(0, 1)],
      brand,
      ['Platform 1', 'Platform 2', ''][randomInt(0, 2)],
      ['NPT Type 1', 'NPT Type 2'][randomInt(0, 1)],
      ['Customer A', 'Customer B', 'Customer C'][randomInt(0, 2)],
      ['Calendar 1', 'Calendar 2'][randomInt(0, 1)],
      ['Activation 1', 'Activation 2'][randomInt(0, 1)],
      ['Type A', 'Type B', 'Type C'][randomInt(0, 2)],
      ['Placement 1', 'Placement 2'][randomInt(0, 1)],
      ['Detail 1', 'Detail 2', 'Detail 3'][randomInt(0, 2)],
      ['Active', 'Pending', 'Completed'][randomInt(0, 2)],
      randomDate(), // Start Date
      randomDate(), // End Date

      // Mental Availability tab columns (17-24)
      franchise,                // MA_Media_GTS
      category,                // MA_Media_Investment
      brand,                   // MA_CP_Investment
      randomQuantity(),        // MA_CP_Quantity
      randomPercentage(),      // MA_HCP_Sales Force Reach
      randomPercentage(),      // MA_HCP_Non Personal Reach
      randomMonetaryValue(),   // MA_HCP_Investment
      randomQuantity(),        // MA_NS_Quantity

      // Physical Availability tab columns (25-29)
      franchise,               // PA_Display_GTS
      randomQuantity(),        // PA_Display_Quantity
      category,                // PA_PP_GTS
      brand,                   // PA_SM_GTS
      randomQuantity(),        // PA_RS_Quantity
    ];

    rows.push({
      id: generateUUID(), // Always use UUID for row IDs
      selected: false,
      cells,
    });
  }

  return rows;
};

// Add a new function specifically for generating a single row
export const generateSingleRow = (): Row => {
  const year = randomDate().split('-')[0];
  const gbu = ['GBU1', 'GBU2', 'GBU3'][randomInt(0, 2)];
  const squad = ['Squad A', 'Squad B', 'Squad C'][randomInt(0, 2)];
  const franchise = franchises[randomInt(0, franchises.length - 1)];
  const category = categories[randomInt(0, categories.length - 1)];
  const brand = brands[randomInt(0, brands.length - 1)];

  const cells = [
    // General tab columns (0-16)
    year,
    gbu,
    squad,
    franchise,
    ['Brand Family A', 'Brand Family B'][randomInt(0, 1)],
    brand,
    ['Platform 1', 'Platform 2', ''][randomInt(0, 2)],
    ['NPT Type 1', 'NPT Type 2'][randomInt(0, 1)],
    ['Customer A', 'Customer B', 'Customer C'][randomInt(0, 2)],
    ['Calendar 1', 'Calendar 2'][randomInt(0, 1)],
    ['Activation 1', 'Activation 2'][randomInt(0, 1)],
    ['Type A', 'Type B', 'Type C'][randomInt(0, 2)],
    ['Placement 1', 'Placement 2'][randomInt(0, 1)],
    ['Detail 1', 'Detail 2', 'Detail 3'][randomInt(0, 2)],
    ['Active', 'Pending', 'Completed'][randomInt(0, 2)],
    randomDate(), // Start Date
    randomDate(), // End Date

    // Mental Availability tab columns (17-24)
    franchise,                // MA_Media_GTS
    category,                // MA_Media_Investment
    brand,                   // MA_CP_Investment
    randomQuantity(),        // MA_CP_Quantity
    randomPercentage(),      // MA_HCP_Sales Force Reach
    randomPercentage(),      // MA_HCP_Non Personal Reach
    randomMonetaryValue(),   // MA_HCP_Investment
    randomQuantity(),        // MA_NS_Quantity

    // Physical Availability tab columns (25-29)
    franchise,               // PA_Display_GTS
    randomQuantity(),        // PA_Display_Quantity
    category,                // PA_PP_GTS
    brand,                   // PA_SM_GTS
    randomQuantity(),        // PA_RS_Quantity
  ];

  return {
    id: generateUUID(), // Generate a unique UUID for the single row
    selected: false,
    cells,
  };
};

// Update the column count constants
export const TOTAL_COLUMNS = 30;  // Total number of columns across all tabs
export const GENERAL_COLUMNS_END = 17;
export const MENTAL_COLUMNS_START = GENERAL_COLUMNS_END;
export const MENTAL_COLUMNS_END = MENTAL_COLUMNS_START + 8;
export const PHYSICAL_COLUMNS_START = MENTAL_COLUMNS_END;
export const PHYSICAL_COLUMNS_END = PHYSICAL_COLUMNS_START + 5; 