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

export const generateMockRows = () => {
  const rows = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < 20; i++) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 7);
    
    rows.push({
      id: String(i + 1),
      selected: false,
      cells: [
        '2025',
        mockData.gbu[Math.floor(Math.random() * mockData.gbu.length)],
        mockData.squad[Math.floor(Math.random() * mockData.squad.length)],
        mockData.franchise[Math.floor(Math.random() * mockData.franchise.length)],
        mockData.brandFamily[Math.floor(Math.random() * mockData.brandFamily.length)],
        mockData.brand[Math.floor(Math.random() * mockData.brand.length)],
        mockData.platform[Math.floor(Math.random() * mockData.platform.length)],
        'Yes',
        mockData.customer[Math.floor(Math.random() * mockData.customer.length)],
        mockData.calendarType[Math.floor(Math.random() * mockData.calendarType.length)],
        mockData.activation[Math.floor(Math.random() * mockData.activation.length)],
        mockData.activationType[Math.floor(Math.random() * mockData.activationType.length)],
        mockData.placement[Math.floor(Math.random() * mockData.placement.length)],
        mockData.tacticDetail[Math.floor(Math.random() * mockData.tacticDetail.length)],
        'Active',
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ]
    });
    
    startDate.setDate(startDate.getDate() + 7);
  }
  
  return rows;
};