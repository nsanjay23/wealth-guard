const fundamentalsData = [
  {
    symbol: "RELI",
    name: "Reliance Industries",
    sector: "Oil & Gas / Telecom",
    price: "₹1,461.00", // Updated to approx current market price
    change: "+0.15%",
    marketCap: "₹19.7T",
    description: "Reliance Industries Limited is a Fortune 500 company and the largest private sector corporation in India. It has evolved from a textiles and polyester company to an integrated player across energy, materials, retail, entertainment, and digital services.",
    ratios: {
      pe: 23.8,
      roe: 8.2,
      debtToEquity: 0.38,
      dividendYield: "0.38%",
      currentRatio: 1.2,
      netProfitMargin: "8.5%"
    },
    healthScore: 85,
    strengths: ["Market Leader in Telecom (Jio)", "Strong Retail Growth", "Diversified Revenue Stream"],
    weaknesses: ["Capital Intensive Business", "Lower Refining Margins"],
    shareholding: {
      promoters: 50.3,
      fii: 19.2,
      dii: 19.5,
      public: 11.0
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [694673, 876396, 899041, 962820, 1025000],
      profit: [67845, 74088, 79020, 84500, 91200]
    },
    cashFlow: {
      operating: [95000, 110000, 125000, 135000, 145000],
      investing: [-80000, -95000, -100000, -110000, -115000],
      financing: [-10000, -5000, -15000, -18000, -20000],
      freeCashFlow: "₹30,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹18.5T",
      totalLiabilities: "₹6.2T",
      equity: "₹12.3T",
      cash: "₹35,000 Cr",
      debt: "₹2.8T"
    },
    peers: [
      { name: "TCS", pe: 24.3, roe: 48.2 },
      { name: "HDFC Bank", pe: 19.8, roe: 18.5 }
    ]
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    sector: "IT Services",
    price: "₹3,209.00", // Updated to match your screenshot
    change: "+0.52%",
    marketCap: "₹11.6T",
    description: "TCS is an IT services, consulting and business solutions organization that has been partnering with many of the world’s largest businesses in their transformation journeys for over 50 years.",
    ratios: {
      pe: 24.3,
      roe: 50.9,
      debtToEquity: 0.0,
      dividendYield: "1.96%",
      currentRatio: 2.6,
      netProfitMargin: "19.2%"
    },
    healthScore: 96,
    strengths: ["Zero Debt", "Best-in-class Margins", "Consistent Dividend Payout"],
    weaknesses: ["Slowing Growth in US/UK", "High Valuation"],
    shareholding: {
      promoters: 71.8,
      fii: 12.7,
      dii: 10.9,
      public: 4.6
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [191754, 225458, 240893, 261500, 285000],
      profit: [38327, 42147, 45908, 49500, 54200]
    },
    cashFlow: {
      operating: [42000, 45000, 48000, 52000, 58000],
      investing: [-2000, -3000, -4000, -5000, -6000],
      financing: [-35000, -38000, -40000, -42000, -45000],
      freeCashFlow: "₹52,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹2.1T",
      totalLiabilities: "₹0.6T",
      equity: "₹1.5T",
      cash: "₹18,000 Cr",
      debt: "₹0 Cr"
    },
    peers: [
      { name: "Infosys", pe: 25.0, roe: 33.7 },
      { name: "HCL Tech", pe: 23.5, roe: 24.1 }
    ]
  },
  {
    symbol: "HDBK",
    name: "HDFC Bank",
    sector: "Banking",
    price: "₹930.55", // Updated
    change: "+0.55%",
    marketCap: "₹15.8T",
    description: "HDFC Bank is India's largest private sector bank by assets. It provides a wide range of financial products and services to over 43 million customers.",
    ratios: {
      pe: 19.8,
      roe: 13.6,
      debtToEquity: 0.95, 
      dividendYield: "1.18%",
      currentRatio: 1.1,
      netProfitMargin: "22.5%"
    },
    healthScore: 90,
    strengths: ["Huge CASA Ratio", "Consistent Asset Quality", "Digital Leadership"],
    weaknesses: ["Merger Integration Costs", "NIM Pressure"],
    shareholding: {
      promoters: 0.0, 
      fii: 47.7,
      dii: 37.2,
      public: 12.1
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [167695, 204600, 284000, 325000, 368000],
      profit: [36961, 44109, 60810, 68500, 75200]
    },
    cashFlow: {
      operating: [50000, 65000, 80000, 95000, 105000],
      investing: [-45000, -55000, -70000, -85000, -90000],
      financing: [15000, 10000, 5000, 2000, -5000],
      freeCashFlow: "₹15,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹35.2T",
      totalLiabilities: "₹30.5T",
      equity: "₹4.7T",
      cash: "₹2,50,000 Cr",
      debt: "₹0 Cr" 
    },
    peers: [
      { name: "ICICI Bank", pe: 19.1, roe: 18.2 },
      { name: "SBI", pe: 11.6, roe: 17.5 }
    ]
  },
  {
    symbol: "INFY",
    name: "Infosys",
    sector: "IT Services",
    price: "₹1,689.10", // Updated
    change: "+5.58%",
    marketCap: "₹7.1T",
    description: "Infosys is a global leader in next-generation digital services and consulting. It enables clients in more than 50 countries to navigate their digital transformation.",
    ratios: {
      pe: 25.0,
      roe: 33.7,
      debtToEquity: 0.11,
      dividendYield: "2.66%",
      currentRatio: 2.2,
      netProfitMargin: "17.1%"
    },
    healthScore: 88,
    strengths: ["Strong Digital Revenue", "Share Buybacks", "High Dividend Yield"],
    weaknesses: ["High Attrition", "Variable Margins"],
    shareholding: {
      promoters: 14.4,
      fii: 33.3,
      dii: 38.4,
      public: 13.9
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [121641, 146767, 153670, 168000, 182000],
      profit: [22110, 24095, 26233, 28500, 31200]
    },
    cashFlow: {
      operating: [23000, 25000, 27000, 29000, 32000],
      investing: [-5000, -6000, -4000, -5000, -6500],
      financing: [-15000, -18000, -20000, -22000, -24000],
      freeCashFlow: "₹25,500 Cr"
    },
    balanceSheet: {
      totalAssets: "₹1.4T",
      totalLiabilities: "₹0.4T",
      equity: "₹1.0T",
      cash: "₹12,500 Cr",
      debt: "₹1,500 Cr"
    },
    peers: [
      { name: "TCS", pe: 24.3, roe: 50.9 },
      { name: "Wipro", pe: 21.5, roe: 16.2 }
    ]
  },
  {
    symbol: "ITC",
    name: "ITC Limited",
    sector: "FMCG",
    price: "₹329.00", // Updated
    change: "-1.72%",
    marketCap: "₹4.1T",
    description: "ITC is one of India's foremost private sector companies with a diversified presence in FMCG, Hotels, Packaging, Paperboards & Specialty Papers and Agri-Business.",
    ratios: {
      pe: 11.8,
      roe: 30.5,
      debtToEquity: 0.0,
      dividendYield: "4.36%",
      currentRatio: 2.9,
      netProfitMargin: "26.5%"
    },
    healthScore: 93,
    strengths: ["Cash Cow Tobacco Biz", "Growing FMCG Portfolio", "High Dividend"],
    weaknesses: ["Tobacco Regulation Risks", "Hotel Biz Cyclicality"],
    shareholding: {
      promoters: 0.0,
      fii: 44.1,
      dii: 42.8,
      public: 13.1
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [60645, 70919, 67932, 78500, 86000],
      profit: [15503, 19477, 20751, 24500, 27800]
    },
    cashFlow: {
      operating: [16000, 18000, 19500, 22000, 25000],
      investing: [-4000, -5000, -6000, -7000, -8000],
      financing: [-10000, -12000, -14000, -15000, -16500],
      freeCashFlow: "₹17,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹0.95T",
      totalLiabilities: "₹0.2T",
      equity: "₹0.75T",
      cash: "₹5,000 Cr",
      debt: "₹0 Cr"
    },
    peers: [
      { name: "HUL", pe: 55.2, roe: 28.5 },
      { name: "Nestle", pe: 82.5, roe: 108.0 }
    ]
  },
  {
    symbol: "BPCL",
    name: "Bharat Petroleum",
    sector: "Oil & Gas",
    price: "₹363.75", // Updated
    change: "+1.92%",
    marketCap: "₹0.78T",
    description: "Bharat Petroleum Corporation Limited is an Indian public sector oil and gas corporation. It operates two large refineries in Kochi and Mumbai.",
    ratios: {
      pe: 7.3,
      roe: 17.1,
      debtToEquity: 0.30,
      dividendYield: "3.89%",
      currentRatio: 0.90,
      netProfitMargin: "5.1%"
    },
    healthScore: 80,
    strengths: ["High Refining Margins", "Government Backing", "High Dividend"],
    weaknesses: ["Oil Price Volatility", "Policy Risk"],
    shareholding: {
      promoters: 53.0,
      fii: 13.5,
      dii: 22.8,
      public: 10.7
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [433436, 473187, 465890, 495000, 520000],
      profit: [11363, 1870, 26673, 24500, 28000]
    },
    cashFlow: {
      operating: [15000, 5000, 30000, 28000, 32000],
      investing: [-10000, -8000, -12000, -15000, -14000],
      financing: [-6000, -2000, -15000, -10000, -12000],
      freeCashFlow: "₹18,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹2.5T",
      totalLiabilities: "₹1.6T",
      equity: "₹0.9T",
      cash: "₹8,500 Cr",
      debt: "₹0.5T"
    },
    peers: [
      { name: "IOCL", pe: 10.5, roe: 8.5 },
      { name: "HPCL", pe: 7.8, roe: 11.2 }
    ]
  },
  {
    symbol: "SBI",
    name: "State Bank of India",
    sector: "Banking",
    price: "₹1,040.60", // Updated
    change: "+1.19%",
    marketCap: "₹9.6T",
    description: "State Bank of India (SBI) is an Indian multinational public sector bank and financial services statutory body. It is the 43rd largest bank in the world.",
    ratios: {
      pe: 11.6,
      roe: 14.5,
      debtToEquity: 1.05,
      dividendYield: "1.53%",
      currentRatio: 1.15,
      netProfitMargin: "15.2%"
    },
    healthScore: 86,
    strengths: ["Largest Branch Network", "Sovereign Backing", "Improving Asset Quality"],
    weaknesses: ["High Pension Liabilities", "Bureaucratic Structure"],
    shareholding: {
      promoters: 57.5,
      fii: 10.3,
      dii: 24.9,
      public: 7.4
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [406000, 473000, 520000, 610000, 685000],
      profit: [31675, 50232, 61077, 72000, 81500]
    },
    cashFlow: {
      operating: [40000, 55000, 70000, 85000, 95000],
      investing: [-35000, -45000, -60000, -75000, -80000],
      financing: [-2000, -5000, -8000, -5000, -10000],
      freeCashFlow: "₹15,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹65.0T",
      totalLiabilities: "₹60.5T",
      equity: "₹4.5T",
      cash: "₹3,00,000 Cr",
      debt: "₹0 Cr"
    },
    peers: [
      { name: "HDFC Bank", pe: 19.8, roe: 13.6 },
      { name: "ICICI Bank", pe: 19.1, roe: 18.2 }
    ]
  },
  {
    symbol: "ICBK",
    name: "ICICI Bank",
    sector: "Banking",
    price: "₹1,413.00", // Updated
    change: "-0.38%",
    marketCap: "₹11.2T",
    description: "ICICI Bank is a leading private sector bank in India. The Bank’s consolidated total assets stood at ₹19.58 trillion as of 2024.",
    ratios: {
      pe: 19.1,
      roe: 16.5,
      debtToEquity: 0.82,
      dividendYield: "0.78%",
      currentRatio: 1.12,
      netProfitMargin: "20.5%"
    },
    healthScore: 94,
    strengths: ["Aggressive Growth", "Tech First Approach", "Strong Retail Book"],
    weaknesses: ["Compliance Risks", "Global Exposure"],
    shareholding: {
      promoters: 0.0,
      fii: 45.7,
      dii: 44.9,
      public: 7.1
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [157536, 186177, 228000, 265000, 298000],
      profit: [23339, 31896, 40888, 48500, 54200]
    },
    cashFlow: {
      operating: [30000, 40000, 52000, 60000, 68000],
      investing: [-25000, -35000, -45000, -55000, -60000],
      financing: [-3000, -4000, -5000, -4000, -5000],
      freeCashFlow: "₹8,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹24.5T",
      totalLiabilities: "₹21.5T",
      equity: "₹3.0T",
      cash: "₹1,80,000 Cr",
      debt: "₹0 Cr"
    },
    peers: [
      { name: "Axis Bank", pe: 17.5, roe: 16.2 },
      { name: "Kotak Bank", pe: 23.5, roe: 14.8 }
    ]
  },
  {
    symbol: "MRF",
    name: "MRF Tyres",
    sector: "Auto Ancillary",
    price: "₹1,42,750.00", // Updated
    change: "-2.00%",
    marketCap: "₹60,552 Cr",
    description: "Madras Rubber Factory (MRF) is India's largest tyre manufacturer. It produces rubber products including tyres, treads, tubes and conveyor belts.",
    ratios: {
      pe: 32.7,
      roe: 9.5,
      debtToEquity: 0.19,
      dividendYield: "0.16%",
      currentRatio: 1.5,
      netProfitMargin: "6.2%"
    },
    healthScore: 82,
    strengths: ["Strong Brand Recall", "Debt Free", "Market Leader"],
    weaknesses: ["Raw Material Sensitivity", "Low Dividend Yield"],
    shareholding: {
      promoters: 27.8,
      fii: 18.7,
      dii: 11.7,
      public: 41.9
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [19316, 23008, 25169, 28500, 31200],
      profit: [669, 769, 2081, 2350, 2580]
    },
    cashFlow: {
      operating: [1500, 2000, 3500, 4000, 4500],
      investing: [-800, -1000, -1500, -2000, -2200],
      financing: [-500, -800, -1000, -1500, -1800],
      freeCashFlow: "₹2,300 Cr"
    },
    balanceSheet: {
      totalAssets: "₹35,000 Cr",
      totalLiabilities: "₹12,000 Cr",
      equity: "₹23,000 Cr",
      cash: "₹2,500 Cr",
      debt: "₹1,200 Cr"
    },
    peers: [
      { name: "Apollo Tyres", pe: 26.5, roe: 12.4 },
      { name: "CEAT", pe: 22.8, roe: 14.5 }
    ]
  },
  {
    symbol: "VDAN",
    name: "Vedanta",
    sector: "Mining & Metals",
    price: "₹681.05", // Updated
    change: "+0.78%",
    marketCap: "₹2.5T",
    description: "Vedanta Limited is a diversified natural resources company, whose business primarily involves producing oil and gas, zinc - lead - silver, copper, iron ore, aluminium and commercial power.",
    ratios: {
      pe: 22.3,
      roe: 40.5,
      debtToEquity: 1.6,
      dividendYield: "7.56%",
      currentRatio: 0.80,
      netProfitMargin: "11.5%"
    },
    healthScore: 72,
    strengths: ["High Dividend Yield", "Diversified Commodities", "Semiconductor Entry"],
    weaknesses: ["High Debt", "Parent Company Leverage"],
    shareholding: {
      promoters: 63.7,
      fii: 9.2,
      dii: 11.5,
      public: 15.6
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [132732, 147308, 143727, 160000, 175000],
      profit: [23710, 14503, 7539, 18500, 24000]
    },
    cashFlow: {
      operating: [25000, 20000, 18000, 28000, 32000],
      investing: [-10000, -12000, -15000, -18000, -20000],
      financing: [-12000, -15000, -10000, -8000, -10000],
      freeCashFlow: "₹12,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹2.1T",
      totalLiabilities: "₹1.4T",
      equity: "₹0.7T",
      cash: "₹8,000 Cr",
      debt: "₹0.95T"
    },
    peers: [
      { name: "Hindalco", pe: 11.8, roe: 13.5 },
      { name: "Tata Steel", pe: 19.8, roe: 12.2 }
    ]
  }
];

export default fundamentalsData;