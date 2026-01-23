const fundamentalsData = [
  {
    symbol: "RELI",
    name: "Reliance Industries",
    sector: "Oil & Gas / Telecom",
    price: "₹1,475.00", 
    change: "+0.45%",
    marketCap: "₹20.1T",
    description: "Reliance Industries Limited is a Fortune 500 company and the largest private sector corporation in India. It has evolved from a textiles and polyester company to an integrated player across energy, materials, retail, entertainment, and digital services.",
    ratios: {
      pe: 24.1,
      roe: 8.5,
      debtToEquity: 0.35,
      dividendYield: "0.38%",
      currentRatio: 1.2,
      netProfitMargin: "8.8%"
    },
    healthScore: 88,
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
      revenue: [694673, 876396, 925000, 985000, 1050000],
      profit: [67845, 74088, 81000, 86500, 93000]
    },
    cashFlow: {
      operating: [95000, 110000, 125000, 138000, 148000],
      investing: [-80000, -95000, -100000, -112000, -118000],
      financing: [-10000, -5000, -15000, -18000, -20000],
      freeCashFlow: "₹30,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹18.8T",
      totalLiabilities: "₹6.1T",
      equity: "₹12.7T",
      cash: "₹38,000 Cr",
      debt: "₹2.6T"
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
    price: "₹3,310.00",
    change: "+0.82%",
    marketCap: "₹12.1T",
    description: "TCS is an IT services, consulting and business solutions organization that has been partnering with many of the world’s largest businesses in their transformation journeys for over 50 years.",
    ratios: {
      pe: 25.2,
      roe: 51.5,
      debtToEquity: 0.0,
      dividendYield: "2.10%",
      currentRatio: 2.7,
      netProfitMargin: "19.5%"
    },
    healthScore: 97,
    strengths: ["Zero Debt", "Best-in-class Margins", "Consistent Dividend Payout"],
    weaknesses: ["Slowing Growth in US/UK", "High Valuation"],
    shareholding: {
      promoters: 72.1,
      fii: 12.5,
      dii: 10.8,
      public: 4.6
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [191754, 225458, 248000, 275000, 305000],
      profit: [38327, 42147, 47500, 52000, 58000]
    },
    cashFlow: {
      operating: [42000, 45000, 50000, 55000, 62000],
      investing: [-2000, -3000, -4500, -5500, -6500],
      financing: [-35000, -38000, -42000, -44000, -48000],
      freeCashFlow: "₹55,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹2.2T",
      totalLiabilities: "₹0.65T",
      equity: "₹1.55T",
      cash: "₹20,000 Cr",
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
    price: "₹1,435.50",
    change: "+1.10%",
    marketCap: "₹16.5T",
    description: "HDFC Bank is India's largest private sector bank by assets. It provides a wide range of financial products and services to over 43 million customers.",
    ratios: {
      pe: 19.5,
      roe: 15.2,
      debtToEquity: 0.98, 
      dividendYield: "1.25%",
      currentRatio: 1.1,
      netProfitMargin: "21.8%"
    },
    healthScore: 92,
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
      revenue: [167695, 204600, 290000, 335000, 380000],
      profit: [36961, 44109, 62000, 70500, 78000]
    },
    cashFlow: {
      operating: [50000, 65000, 85000, 98000, 110000],
      investing: [-45000, -55000, -75000, -88000, -95000],
      financing: [15000, 10000, 8000, 4000, -2000],
      freeCashFlow: "₹18,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹36.5T",
      totalLiabilities: "₹31.2T",
      equity: "₹5.3T",
      cash: "₹2,60,000 Cr",
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
    price: "₹1,695.00",
    change: "+1.25%",
    marketCap: "₹7.2T",
    description: "Infosys is a global leader in next-generation digital services and consulting. It enables clients in more than 50 countries to navigate their digital transformation.",
    ratios: {
      pe: 25.5,
      roe: 32.5,
      debtToEquity: 0.12,
      dividendYield: "2.75%",
      currentRatio: 2.1,
      netProfitMargin: "17.4%"
    },
    healthScore: 89,
    strengths: ["Strong Digital Revenue", "Share Buybacks", "High Dividend Yield"],
    weaknesses: ["High Attrition", "Variable Margins"],
    shareholding: {
      promoters: 14.6,
      fii: 33.1,
      dii: 38.5,
      public: 13.8
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [121641, 146767, 158000, 172000, 188000],
      profit: [22110, 24095, 26800, 29500, 32500]
    },
    cashFlow: {
      operating: [23000, 25000, 28000, 30500, 34000],
      investing: [-5000, -6000, -5000, -6000, -7000],
      financing: [-15000, -18000, -21000, -23000, -25000],
      freeCashFlow: "₹26,500 Cr"
    },
    balanceSheet: {
      totalAssets: "₹1.5T",
      totalLiabilities: "₹0.45T",
      equity: "₹1.05T",
      cash: "₹14,000 Cr",
      debt: "₹1,200 Cr"
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
    price: "₹415.50",
    change: "-0.50%",
    marketCap: "₹5.2T",
    description: "ITC is one of India's foremost private sector companies with a diversified presence in FMCG, Hotels, Packaging, Paperboards & Specialty Papers and Agri-Business.",
    ratios: {
      pe: 24.5,
      roe: 29.5,
      debtToEquity: 0.0,
      dividendYield: "3.50%",
      currentRatio: 3.1,
      netProfitMargin: "27.2%"
    },
    healthScore: 94,
    strengths: ["Cash Cow Tobacco Biz", "Growing FMCG Portfolio", "High Dividend"],
    weaknesses: ["Tobacco Regulation Risks", "Hotel Biz Cyclicality"],
    shareholding: {
      promoters: 0.0,
      fii: 43.5,
      dii: 42.1,
      public: 14.4
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [60645, 70919, 75000, 82000, 91000],
      profit: [15503, 19477, 21500, 25200, 29000]
    },
    cashFlow: {
      operating: [16000, 18000, 20500, 23000, 26000],
      investing: [-4000, -5000, -6500, -7500, -8500],
      financing: [-10000, -12000, -14500, -16000, -17500],
      freeCashFlow: "₹19,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹1.1T",
      totalLiabilities: "₹0.25T",
      equity: "₹0.85T",
      cash: "₹6,000 Cr",
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
    price: "₹385.00",
    change: "+1.20%",
    marketCap: "₹0.85T",
    description: "Bharat Petroleum Corporation Limited is an Indian public sector oil and gas corporation. It operates two large refineries in Kochi and Mumbai.",
    ratios: {
      pe: 8.5,
      roe: 18.2,
      debtToEquity: 0.28,
      dividendYield: "3.50%",
      currentRatio: 0.95,
      netProfitMargin: "5.5%"
    },
    healthScore: 81,
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
      revenue: [433436, 473187, 490000, 515000, 545000],
      profit: [11363, 1870, 28500, 26000, 30500]
    },
    cashFlow: {
      operating: [15000, 5000, 32000, 30000, 34000],
      investing: [-10000, -8000, -13000, -16000, -15000],
      financing: [-6000, -2000, -16000, -11000, -13000],
      freeCashFlow: "₹20,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹2.6T",
      totalLiabilities: "₹1.65T",
      equity: "₹0.95T",
      cash: "₹9,000 Cr",
      debt: "₹0.48T"
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
    price: "₹780.00",
    change: "+0.95%",
    marketCap: "₹7.0T",
    description: "State Bank of India (SBI) is an Indian multinational public sector bank and financial services statutory body. It is the 43rd largest bank in the world.",
    ratios: {
      pe: 9.8,
      roe: 16.5,
      debtToEquity: 1.02,
      dividendYield: "1.85%",
      currentRatio: 1.18,
      netProfitMargin: "16.5%"
    },
    healthScore: 88,
    strengths: ["Largest Branch Network", "Sovereign Backing", "Improving Asset Quality"],
    weaknesses: ["High Pension Liabilities", "Bureaucratic Structure"],
    shareholding: {
      promoters: 57.5,
      fii: 10.5,
      dii: 24.7,
      public: 7.3
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [406000, 473000, 540000, 630000, 710000],
      profit: [31675, 50232, 65000, 75500, 85000]
    },
    cashFlow: {
      operating: [40000, 55000, 75000, 88000, 98000],
      investing: [-35000, -45000, -62000, -78000, -84000],
      financing: [-2000, -5000, -9000, -6000, -11000],
      freeCashFlow: "₹18,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹68.0T",
      totalLiabilities: "₹63.2T",
      equity: "₹4.8T",
      cash: "₹3,20,000 Cr",
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
    price: "₹1,250.00",
    change: "-0.25%",
    marketCap: "₹8.8T",
    description: "ICICI Bank is a leading private sector bank in India. The Bank’s consolidated total assets stood at ₹19.58 trillion as of 2024.",
    ratios: {
      pe: 18.5,
      roe: 17.8,
      debtToEquity: 0.85,
      dividendYield: "0.95%",
      currentRatio: 1.15,
      netProfitMargin: "21.2%"
    },
    healthScore: 95,
    strengths: ["Aggressive Growth", "Tech First Approach", "Strong Retail Book"],
    weaknesses: ["Compliance Risks", "Global Exposure"],
    shareholding: {
      promoters: 0.0,
      fii: 45.1,
      dii: 45.2,
      public: 9.7
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [157536, 186177, 235000, 275000, 315000],
      profit: [23339, 31896, 42500, 50000, 58500]
    },
    cashFlow: {
      operating: [30000, 40000, 55000, 64000, 72000],
      investing: [-25000, -35000, -48000, -58000, -64000],
      financing: [-3000, -4000, -5500, -4500, -6000],
      freeCashFlow: "₹10,000 Cr"
    },
    balanceSheet: {
      totalAssets: "₹26.5T",
      totalLiabilities: "₹23.0T",
      equity: "₹3.5T",
      cash: "₹1,95,000 Cr",
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
    price: "₹1,45,200.00",
    change: "-1.50%",
    marketCap: "₹61,800 Cr",
    description: "Madras Rubber Factory (MRF) is India's largest tyre manufacturer. It produces rubber products including tyres, treads, tubes and conveyor belts.",
    ratios: {
      pe: 34.2,
      roe: 10.2,
      debtToEquity: 0.18,
      dividendYield: "0.15%",
      currentRatio: 1.6,
      netProfitMargin: "6.5%"
    },
    healthScore: 84,
    strengths: ["Strong Brand Recall", "Debt Free", "Market Leader"],
    weaknesses: ["Raw Material Sensitivity", "Low Dividend Yield"],
    shareholding: {
      promoters: 27.8,
      fii: 18.5,
      dii: 11.9,
      public: 41.8
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [19316, 23008, 26500, 29800, 33000],
      profit: [669, 769, 2150, 2480, 2750]
    },
    cashFlow: {
      operating: [1500, 2000, 3800, 4200, 4800],
      investing: [-800, -1000, -1600, -2100, -2300],
      financing: [-500, -800, -1200, -1600, -1900],
      freeCashFlow: "₹2,500 Cr"
    },
    balanceSheet: {
      totalAssets: "₹36,500 Cr",
      totalLiabilities: "₹12,500 Cr",
      equity: "₹24,000 Cr",
      cash: "₹2,800 Cr",
      debt: "₹1,100 Cr"
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
    price: "₹455.00",
    change: "+0.65%",
    marketCap: "₹1.7T",
    description: "Vedanta Limited is a diversified natural resources company, whose business primarily involves producing oil and gas, zinc - lead - silver, copper, iron ore, aluminium and commercial power.",
    ratios: {
      pe: 14.5,
      roe: 35.5,
      debtToEquity: 1.8,
      dividendYield: "8.50%",
      currentRatio: 0.85,
      netProfitMargin: "12.2%"
    },
    healthScore: 75,
    strengths: ["High Dividend Yield", "Diversified Commodities", "Semiconductor Entry"],
    weaknesses: ["High Debt", "Parent Company Leverage"],
    shareholding: {
      promoters: 63.7,
      fii: 9.1,
      dii: 11.6,
      public: 15.6
    },
    history: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      revenue: [132732, 147308, 152000, 168000, 185000],
      profit: [23710, 14503, 9500, 20500, 26000]
    },
    cashFlow: {
      operating: [25000, 20000, 19500, 29500, 34000],
      investing: [-10000, -12000, -16000, -19000, -21500],
      financing: [-12000, -15000, -11000, -9000, -11000],
      freeCashFlow: "₹13,500 Cr"
    },
    balanceSheet: {
      totalAssets: "₹2.2T",
      totalLiabilities: "₹1.45T",
      equity: "₹0.75T",
      cash: "₹9,500 Cr",
      debt: "₹1.0T"
    },
    peers: [
      { name: "Hindalco", pe: 11.8, roe: 13.5 },
      { name: "Tata Steel", pe: 19.8, roe: 12.2 }
    ]
  }
];

export default fundamentalsData;