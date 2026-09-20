export type BusinessCategory =
  | 'jewellery'
  | 'real_estate'
  | 'clothing'
  | 'petrol_pump'
  | 'grocery'
  | 'electronics'
  | 'pharmacy'
  | 'automobile'
  | 'restaurant'
  | 'wholesale'
  | 'retail'
  | 'services'
  | 'general';

export type UserRole = 'owner' | 'employee';

export interface BusinessFeatures {
  goldRates: boolean;
  propertyCRM: boolean;
  sizeVariants: boolean;
  fuelDispensers: boolean;
  batchExpiry: boolean;
  imeiTracking: boolean;
  udhaarLedger: boolean;
  makingCharges: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  category: BusinessCategory;
  customCategoryName?: string;
  tagline: string;
  address?: string;
  phone?: string;
  ownerName: string;
  role: UserRole;
  pinCode?: string;
  isPinLocked?: boolean;
  suggestedUnits: string[];
  featuresEnabled: BusinessFeatures;
  goldRates?: {
    rate24k: number; // PKR per tola
    rate22k: number;
    rate21k: number;
    rate18k: number;
    lastUpdated: string;
  };
  fuelRates?: {
    petrol: number; // PKR per Litre
    diesel: number;
    hiOctane: number;
    lastUpdated: string;
  };
  createdAt: string;
}

export interface CustomerTransaction {
  id: string;
  date: string;
  type: 'udhaar_given' | 'payment_received' | 'sale' | 'purchase';
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Udhaar' | 'Cheque' | 'Split';
  notes?: string;
  billNumber?: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  type: 'customer' | 'supplier' | 'dealer' | 'investor';
  city?: string;
  totalReceivable: number; // Lene hain (Customer owes business)
  totalPayable: number;    // Dene hain (Business owes supplier/customer)
  lastPaymentDate?: string;
  dueDate?: string;
  notes?: string;
  transactions: CustomerTransaction[];
}

export interface ProductVariant {
  size: string;
  color?: string;
  stock: number;
  sku?: string;
}

export interface ProductItem {
  id: string;
  businessId: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  minStockAlert?: number;
  damagedStock?: number;
  barcode?: string;
  // Jewellery specific
  goldPurity?: '24K' | '22K' | '21K' | '18K';
  weightTola?: number;
  weightMasha?: number;
  weightRatti?: number;
  weightGram?: number;
  makingCharges?: number; // Katai / Mazdoori
  stoneCharges?: number;  // Nagina / Diamonds
  // Real Estate specific
  propertyType?: 'Residential Plot' | 'Commercial Plot' | 'House' | 'Apartment' | 'Shop' | 'Office' | 'File' | 'Agricultural Land';
  plotNo?: string;
  marla?: number;
  areaMarla?: number;
  kanal?: number;
  sqFt?: number;
  location?: string;
  block?: string;
  sector?: string;
  propertyStatus?: 'Available' | 'Token Paid' | 'Installment Active' | 'Sold' | 'Under Dispute';
  installmentPlan?: {
    totalInstallments: number;
    paidInstallments: number;
    monthlyAmount: number;
    nextDueDate: string;
  };
  // Clothing specific
  brand?: string;
  fabric?: string;
  season?: string;
  variants?: ProductVariant[];
  // Petrol Pump specific
  tankCapacity?: number;
  currentDipCm?: number;
  nozzles?: number;
  fuelType?: 'Super Petrol' | 'Euro-V Diesel' | 'Hi-Octane' | 'Engine Oil' | 'CNG';
}

export interface SaleTransaction {
  id: string;
  businessId: string;
  date: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    costPrice?: number;
    unit: string;
    total: number;
    meta?: Record<string, any>;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  receivedAmount: number;
  udhaarAmount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Udhaar' | 'Split' | 'Cheque';
  notes?: string;
  type: 'sale' | 'expense' | 'fuel_log' | 'property_deal';
}

export interface ExpenseRecord {
  id: string;
  businessId: string;
  date: string;
  category: 'Rent' | 'Electricity & Generator' | 'Staff Salary' | 'Transportation & Freight' | 'Karigar Labour' | 'Tea & Refreshment' | 'Maintenance' | 'Marketing' | 'Salary' | 'Electricity' | 'Supplier' | 'Other';
  amount: number;
  paymentMethod: 'Cash' | 'Bank' | 'Easypaisa' | 'JazzCash' | 'Bank Transfer';
  paidTo?: string;
  notes?: string;
}

export interface VoiceLog {
  id: string;
  timestamp: string;
  speaker: 'user' | 'ayesha';
  text: string;
  urduText?: string;
  actionTaken?: string;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'alert' | 'recommendation' | 'anomaly';
  title: string;
  description: string;
  category: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  actionPrompt?: string;
}

export interface MonthlyAdvisorReport {
  executiveSummary: string;
  salesGrowthAnalysis: string;
  profitMarginEvaluation: string;
  topPerformingCategories: string[];
  slowMovingWarning: string;
  creditRecoveryRiskAssessment: string;
  actionableRecommendations: string[];
  projectedNextMonthOutlook: string;
  generatedDate: string;
}
