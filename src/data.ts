// Constants for column counts
export const GENERAL_COLUMNS_END = 17;  // General tab columns (0-16)
export const MENTAL_COLUMNS_COUNT = 9;  // Mental Availability columns (17-25)
export const PHYSICAL_COLUMNS_COUNT = 5; // Physical Availability columns (26-30)
export const TOTAL_COLUMNS = GENERAL_COLUMNS_END + MENTAL_COLUMNS_COUNT + PHYSICAL_COLUMNS_COUNT; // Total 30 columns

export const mockData = {
  gbu: ['SELF CARE', 'SKIN HEALTH & BEAUTY', 'TEHA', 'ALL'],
  squad: ['BABY CARE', 'BODY CARE', 'DIGESTIVE HEALTH', 'FACE CARE', 'HAIR CARE', 'ORAL CARE', 'PAIN + COLD', 'SUN & MAKE UP', 'WOUND', 'ZARBEES', 'ALL'],
  franchise: ['ADULT ALLERGY', 'ADULT ANALGESICS', 'ADULT INCONTINENCE', 'AVEENO HAIR', 'BABY CARE - AVEENO', 'BABY CARE - JOHNSONS', 'BABY CARE - VIVI & BLOOM', 'BODY CARE - AVEENO + LUBRIDERM', 'BODY CARE - NTG', 'CHILDRENS ANALGESICS', 'CHILDRENS UPPER RESPIRATORY ALLERGY'],
  brandFamily: ['ALTERNAGEL', 'AVEENO', 'BANDAID', 'BENADRYL', 'BENGAY', 'CLEAN & CLEAR', 'COACH', 'DESTIN', 'IMODIUM', 'J&J REACH', 'J&J RED CROSS'],
  brand: ['ADULT COUGH', 'ADULT IMMUNE', 'ADULT MOTION HOSPITAL PACKS', 'ADULT SLEEP', 'ADULT TYLENOL', 'ADULT TYLENOL ES RAPID RELEASE GELS', 'ADULT TYLENOL HOSPITAL PACKS'],
  platform: ['Aveeno Body Yogurt', 'Aveeno Calm & Restore', 'Aveeno Daily Moisturizing Lotion', 'Aveeno Eczema', 'Aveeno Eczema Rescue', 'Aveeno Hair'],
  customer: ['ALBERTSONS', 'AMAZON', 'BJS', 'COSTCO', 'CVS', 'DOLLAR GENERAL', 'FAMILY DOLLAR', 'HEB', 'KROGER', 'MEIJER', 'PUBLIX', 'SAMS', 'TARGET', 'ULTA', 'WALGREENS', 'WALMART'],
  calendarType: ['Golden Calendar', 'HCP', 'National Marketing', 'Shopper Marketing & Price Promotion', 'Trade', 'Sampling (National)', 'Sampling (Retailer)', 'Shopper Marketing'],
  activation: ['Display', 'HCP', 'Social Media', 'Retail Media', 'Sampling'],
  activationType: ['Audio', 'Big Bet', 'BOGO X% Off', 'Buy X Get Y Free', 'Buy X Get $X', 'Clip strips', 'Coupon', 'Counter Unit', 'DFSI', 'Digital Campaign'],
  placement: ['Digital Offsite: Display/Social', 'Digital Offsite: Video/CTV', 'Digital Onsite', 'Fees', 'In Store', 'Key Moments', 'Linear TV', 'Other', 'Print', 'Promo+Deals'],
  tacticDetail: ['Submitted', 'Proposed', 'In Progress', 'Completed', 'Cancelled']
};

// Helper function to generate random data
const randomFromArray = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const generateMockRows = () => {
  const rows = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < 20; i++) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 7);
    
    // Generate shared values to maintain consistency across tabs
    const franchise = randomFromArray(mockData.franchise);
    const category = randomFromArray(mockData.squad);
    const brand = randomFromArray(mockData.brand);
    
    rows.push({
      id: `row-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      selected: false,
      cells: [
        // General tab columns (0-16)
        '2025',
        randomFromArray(mockData.gbu),
        randomFromArray(mockData.squad),
        franchise,
        randomFromArray(mockData.brandFamily),
        brand,
        randomFromArray(mockData.platform),
        'Yes',
        randomFromArray(mockData.customer),
        randomFromArray(mockData.calendarType),
        randomFromArray(mockData.activation),
        randomFromArray(mockData.activationType),
        randomFromArray(mockData.placement),
        randomFromArray(mockData.tacticDetail),
        'Active',
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],

        // Mental Availability tab columns (17-25)
        franchise,                // MA_Media_GTS
        category,                // MA_Media_Investment
        franchise,                // MA_CP_GTS
        brand,                   // MA_CP_Investment
        String(Math.floor(Math.random() * 100000)),        // MA_CP_Quantity
        `${Math.floor(Math.random() * 100)}%`,      // MA_HCP_Sales Force Reach
        `${Math.floor(Math.random() * 100)}%`,      // MA_HCP_Non Personal Reach
        `$${(Math.random() * 1000000).toFixed(2)}`,   // MA_HCP_Investment
        String(Math.floor(Math.random() * 100000)),        // MA_NS_Quantity

        // Physical Availability tab columns (26-30)
        franchise,               // PA_Display_GTS
        String(Math.floor(Math.random() * 100000)),        // PA_Display_Quantity
        category,                // PA_PP_GTS
        brand,                   // PA_SM_GTS
        String(Math.floor(Math.random() * 100000))         // PA_RS_Quantity
      ]
    });
    
    startDate.setDate(startDate.getDate() + 7);
  }
  
  return rows;
};

// Add the generateSingleRow function
export const generateSingleRow = () => {
  // Create an array of empty strings with the correct length for all tabs
  const emptyCells = Array(TOTAL_COLUMNS).fill('');
  
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    selected: false,
    cells: emptyCells
  };
};