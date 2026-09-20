import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BusinessProfile,
  Customer,
  CustomerTransaction,
  ProductItem,
  SaleTransaction,
  ExpenseRecord,
  AIInsight,
  VoiceLog,
  UserRole,
} from '../types';
import {
  INITIAL_BUSINESSES,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_INSIGHTS,
} from '../data/initialData';

interface KhataContextType {
  businesses: BusinessProfile[];
  activeBusiness: BusinessProfile;
  switchBusiness: (id: string) => void;
  addNewBusiness: (profile: Partial<BusinessProfile>) => string;
  updateBusiness: (updates: Partial<BusinessProfile>) => void;
  deleteBusiness: (id: string) => void;
  
  products: ProductItem[];
  addProduct: (item: Omit<ProductItem, 'id' | 'businessId'>) => void;
  updateProduct: (id: string, updates: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  renameCategory: (oldCategory: string, newCategory: string) => void;
  adjustStock: (id: string, delta: number, reason?: string) => void;
  
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'businessId' | 'transactions'>) => string;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addCustomerTransaction: (customerId: string, tx: Omit<CustomerTransaction, 'id'>) => void;
  
  sales: SaleTransaction[];
  recordSale: (sale: Omit<SaleTransaction, 'id' | 'businessId'>) => void;
  
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'businessId'>) => void;
  
  insights: AIInsight[];
  dismissInsight: (id: string) => void;
  
  voiceLogs: VoiceLog[];
  isVoiceAssistantOpen: boolean;
  setIsVoiceAssistantOpen: (open: boolean) => void;
  processVoiceTranscript: (transcript: string) => Promise<{
    success: boolean;
    voiceResponseText: string;
    urduScript?: string;
    actionTaken?: string;
  }>;
  
  askAICopilot: (query: string) => Promise<string>;
  generateMonthlyReport: () => Promise<any>;
  
  updateGoldRate: (rate24k: number) => void;
  updateFuelRates: (rates: { petrol?: number; diesel?: number; hiOctane?: number }) => void;
  
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  
  exportDataJson: () => void;
  importDataJson: (jsonStr: string) => boolean;
  resetToDefaults: () => void;
}

const KhataContext = createContext<KhataContextType | null>(null);

const STORAGE_KEYS = {
  BUSINESSES: 'ai_khata_businesses_v1',
  ACTIVE_BIZ_ID: 'ai_khata_active_biz_id_v1',
  PRODUCTS: 'ai_khata_products_v1',
  CUSTOMERS: 'ai_khata_customers_v1',
  TRANSACTIONS: 'ai_khata_transactions_v1',
  EXPENSES: 'ai_khata_expenses_v1',
  INSIGHTS: 'ai_khata_insights_v1',
  VOICE_LOGS: 'ai_khata_voice_logs_v1',
  ROLE: 'ai_khata_user_role_v1',
};

export const KhataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Businesses
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
    return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
  });

  const [activeBizId, setActiveBizId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_BIZ_ID);
    return saved || businesses[0]?.id || 'biz_jewellery_01';
  });

  // 2. Multi-business products dictionary
  const [allProducts, setAllProducts] = useState<Record<string, ProductItem[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // 3. Multi-business customers dictionary
  const [allCustomers, setAllCustomers] = useState<Record<string, Customer[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // 4. Multi-business sales dictionary
  const [allSales, setAllSales] = useState<Record<string, SaleTransaction[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // 5. Multi-business expenses dictionary
  const [allExpenses, setAllExpenses] = useState<Record<string, ExpenseRecord[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // 6. Multi-business insights dictionary
  const [allInsights, setAllInsights] = useState<Record<string, AIInsight[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
    return saved ? JSON.parse(saved) : INITIAL_INSIGHTS;
  });

  // 7. Voice logs & UI state
  const [voiceLogs, setVoiceLogs] = useState<VoiceLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOICE_LOGS);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'v_init_1',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            speaker: 'ayesha',
            text: 'Assalam-o-Alaikum! Main aapki AI Khata Voice Assistant hoon. Aap Urdu, Roman Urdu ya English me bol kar khata update kar sakte hain.',
            urduScript: 'السلام علیکم! میں آپ کی اے آئی کھاتہ وائس اسسٹنٹ ہوں۔ آپ بول کر کھاتہ اپ ڈیٹ کر سکتے ہیں۔',
          },
        ];
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'owner';
  });

  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BIZ_ID, activeBizId);
  }, [activeBizId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(allProducts));
  }, [allProducts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(allCustomers));
  }, [allCustomers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allSales));
  }, [allSales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(allExpenses));
  }, [allExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(allInsights));
  }, [allInsights]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOICE_LOGS, JSON.stringify(voiceLogs));
  }, [voiceLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, userRole);
  }, [userRole]);

  const activeBusiness =
    businesses.find((b) => b.id === activeBizId) || businesses[0] || INITIAL_BUSINESSES[0];

  const products = allProducts[activeBizId] || [];
  const customers = allCustomers[activeBizId] || [];
  const sales = allSales[activeBizId] || [];
  const expenses = allExpenses[activeBizId] || [];
  const insights = allInsights[activeBizId] || [];

  // Switch active business
  const switchBusiness = (id: string) => {
    if (businesses.some((b) => b.id === id)) {
      setActiveBizId(id);
    }
  };

  // Add new business
  const addNewBusiness = (profile: Partial<BusinessProfile>): string => {
    const newId = `biz_${Date.now()}`;
    const defaultFeatures = {
      goldRates: profile.category === 'jewellery',
      propertyCRM: profile.category === 'real_estate',
      sizeVariants: profile.category === 'clothing',
      fuelDispensers: profile.category === 'petrol_pump',
      batchExpiry: profile.category === 'pharmacy' || profile.category === 'grocery',
      imeiTracking: profile.category === 'electronics',
      udhaarLedger: true,
      makingCharges: profile.category === 'jewellery',
    };

    const newBiz: BusinessProfile = {
      id: newId,
      name: profile.name || 'My New Business',
      category: profile.category || 'general',
      customCategoryName: profile.customCategoryName || undefined,
      tagline: profile.tagline || 'Modern AI Powered Business Khata',
      address: profile.address || 'Pakistan',
      phone: profile.phone || '',
      ownerName: profile.ownerName || 'Business Owner',
      role: 'owner',
      pinCode: '1234',
      isPinLocked: false,
      suggestedUnits: profile.suggestedUnits || ['Piece', 'Pack', 'Item'],
      featuresEnabled: profile.featuresEnabled || defaultFeatures,
      goldRates:
        profile.category === 'jewellery'
          ? {
              rate24k: 485000,
              rate22k: 444580,
              rate21k: 424375,
              rate18k: 363750,
              lastUpdated: new Date().toISOString(),
            }
          : undefined,
      fuelRates:
        profile.category === 'petrol_pump'
          ? {
              petrol: 275.6,
              diesel: 284.4,
              hiOctane: 298.0,
              lastUpdated: new Date().toISOString(),
            }
          : undefined,
      createdAt: new Date().toISOString(),
    };

    setBusinesses((prev) => [...prev, newBiz]);
    setActiveBizId(newId);

    // Initialize blank sets for new business
    setAllProducts((prev) => ({ ...prev, [newId]: [] }));
    setAllCustomers((prev) => ({ ...prev, [newId]: [] }));
    setAllSales((prev) => ({ ...prev, [newId]: [] }));
    setAllExpenses((prev) => ({ ...prev, [newId]: [] }));
    setAllInsights((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `ins_init_${Date.now()}`,
          type: 'trend',
          title: 'Khata Setup Complete',
          description: `AI has configured your ledger and units tailored specifically for ${newBiz.name}.`,
          category: 'Setup',
          timestamp: 'Just now',
          priority: 'medium',
        },
      ],
    }));

    return newId;
  };

  const updateBusiness = (updates: Partial<BusinessProfile>) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === activeBizId ? { ...b, ...updates } : b))
    );
  };

  const deleteBusiness = (id: string) => {
    if (businesses.length <= 1) return;
    const remaining = businesses.filter((b) => b.id !== id);
    setBusinesses(remaining);
    if (activeBizId === id) {
      setActiveBizId(remaining[0].id);
    }
  };

  // Products
  const addProduct = (item: Omit<ProductItem, 'id' | 'businessId'>) => {
    const newItem: ProductItem = {
      ...item,
      id: `prod_${Date.now()}`,
      businessId: activeBizId,
    };
    setAllProducts((prev) => ({
      ...prev,
      [activeBizId]: [newItem, ...(prev[activeBizId] || [])],
    }));
  };

  const updateProduct = (id: string, updates: Partial<ProductItem>) => {
    setAllProducts((prev) => ({
      ...prev,
      [activeBizId]: (prev[activeBizId] || []).map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  const deleteProduct = (id: string) => {
    setAllProducts((prev) => ({
      ...prev,
      [activeBizId]: (prev[activeBizId] || []).filter((p) => p.id !== id),
    }));
  };

  const renameCategory = (oldCategory: string, newCategory: string) => {
    if (!oldCategory || !newCategory || oldCategory.trim() === newCategory.trim()) return;
    const trimmedNew = newCategory.trim();
    setAllProducts((prev) => ({
      ...prev,
      [activeBizId]: (prev[activeBizId] || []).map((p) =>
        p.category === oldCategory ? { ...p, category: trimmedNew } : p
      ),
    }));
  };

  const adjustStock = (id: string, delta: number, _reason?: string) => {
    setAllProducts((prev) => ({
      ...prev,
      [activeBizId]: (prev[activeBizId] || []).map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      ),
    }));
  };

  // Customers
  const addCustomer = (customer: Omit<Customer, 'id' | 'businessId' | 'transactions'>): string => {
    const newId = `cust_${Date.now()}`;
    const newCust: Customer = {
      ...customer,
      id: newId,
      businessId: activeBizId,
      transactions: [],
    };
    setAllCustomers((prev) => ({
      ...prev,
      [activeBizId]: [newCust, ...(prev[activeBizId] || [])],
    }));
    return newId;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setAllCustomers((prev) => ({
      ...prev,
      [activeBizId]: (prev[activeBizId] || []).map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  };

  const deleteCustomer = (id: string) => {
    setAllCustomers((prev) => ({
      ...prev,
      [activeBizId]: (prev[activeBizId] || []).filter((c) => c.id !== id),
    }));
  };

  const addCustomerTransaction = (customerId: string, tx: Omit<CustomerTransaction, 'id'>) => {
    const newTx: CustomerTransaction = {
      ...tx,
      id: `tx_${Date.now()}`,
    };

    setAllCustomers((prev) => {
      const list = prev[activeBizId] || [];
      return {
        ...prev,
        [activeBizId]: list.map((c) => {
          if (c.id === customerId) {
            let newReceivable = c.totalReceivable;
            let newPayable = c.totalPayable;

            if (tx.type === 'udhaar_given') {
              newReceivable += tx.amount;
            } else if (tx.type === 'payment_received') {
              newReceivable = Math.max(0, newReceivable - tx.amount);
            }

            return {
              ...c,
              totalReceivable: newReceivable,
              totalPayable: newPayable,
              lastPaymentDate: new Date().toISOString().split('T')[0],
              transactions: [newTx, ...c.transactions],
            };
          }
          return c;
        }),
      };
    });
  };

  // Sales
  const recordSale = (sale: Omit<SaleTransaction, 'id' | 'businessId'>) => {
    const newSale: SaleTransaction = {
      ...sale,
      id: `sale_${Date.now()}`,
      businessId: activeBizId,
    };

    setAllSales((prev) => ({
      ...prev,
      [activeBizId]: [newSale, ...(prev[activeBizId] || [])],
    }));

    // If sale contains udhaar, update or create customer credit
    if (sale.udhaarAmount > 0 && sale.customerName) {
      const existing = customers.find(
        (c) => c.name.toLowerCase() === sale.customerName.toLowerCase()
      );
      if (existing) {
        addCustomerTransaction(existing.id, {
          date: new Date().toISOString(),
          type: 'udhaar_given',
          amount: sale.udhaarAmount,
          paymentMethod: 'Udhaar',
          notes: `Sale #${newSale.id.slice(-4)}: ${sale.items.map((i) => i.productName).join(', ')}`,
        });
      } else {
        const newCustId = addCustomer({
          name: sale.customerName,
          phone: sale.customerPhone || '',
          type: 'customer',
          totalReceivable: sale.udhaarAmount,
          totalPayable: 0,
          notes: `Added automatically via POS sale #${newSale.id.slice(-4)}`,
        });
        addCustomerTransaction(newCustId, {
          date: new Date().toISOString(),
          type: 'udhaar_given',
          amount: sale.udhaarAmount,
          paymentMethod: 'Udhaar',
          notes: `Sale invoice balance`,
        });
      }
    }

    // Deduct stock
    sale.items.forEach((item) => {
      adjustStock(item.productId, -item.quantity, 'Sale');
    });
  };

  // Expenses
  const addExpense = (expense: Omit<ExpenseRecord, 'id' | 'businessId'>) => {
    const newExp: ExpenseRecord = {
      ...expense,
      id: `exp_${Date.now()}`,
      businessId: activeBizId,
    };
    setAllExpenses((prev) => ({
      ...prev,
      [activeBizId]: [newExp, ...(prev[activeBizId] || [])],
    }));
  };

  // Insights
  const dismissInsight = (id: string) => {
    setAllInsights((prev) => ({
      ...prev,
      [activeBizId]: (prev[activeBizId] || []).filter((i) => i.id !== id),
    }));
  };

  // Gold rate updater
  const updateGoldRate = (rate24k: number) => {
    const rate22k = Math.round((rate24k / 24) * 22);
    const rate21k = Math.round((rate24k / 24) * 21);
    const rate18k = Math.round((rate24k / 24) * 18);

    updateBusiness({
      goldRates: {
        rate24k,
        rate22k,
        rate21k,
        rate18k,
        lastUpdated: new Date().toISOString(),
      },
    });

    // Also update jewellery selling prices dynamically based on gold weight!
    setAllProducts((prev) => {
      const list = prev[activeBizId] || [];
      return {
        ...prev,
        [activeBizId]: list.map((p) => {
          if (p.weightTola && p.goldPurity) {
            let activePerTolaRate = rate24k;
            if (p.goldPurity === '22K') activePerTolaRate = rate22k;
            if (p.goldPurity === '21K') activePerTolaRate = rate21k;
            if (p.goldPurity === '18K') activePerTolaRate = rate18k;

            const goldCost = Math.round(p.weightTola * activePerTolaRate);
            const totalCost = goldCost + (p.makingCharges || 0) + (p.stoneCharges || 0);
            const price = Math.round(totalCost * 1.08); // 8% standard margin

            return { ...p, cost: totalCost, price };
          }
          return p;
        }),
      };
    });
  };

  // Fuel rate updater
  const updateFuelRates = (rates: { petrol?: number; diesel?: number; hiOctane?: number }) => {
    const current = activeBusiness.fuelRates || {
      petrol: 275.6,
      diesel: 284.4,
      hiOctane: 298.0,
      lastUpdated: new Date().toISOString(),
    };

    updateBusiness({
      fuelRates: {
        petrol: rates.petrol ?? current.petrol,
        diesel: rates.diesel ?? current.diesel,
        hiOctane: rates.hiOctane ?? current.hiOctane,
        lastUpdated: new Date().toISOString(),
      },
    });
  };

  // 4. Voice Action Processing
  const processVoiceTranscript = async (
    transcript: string
  ): Promise<{
    success: boolean;
    voiceResponseText: string;
    urduScript?: string;
    actionTaken?: string;
  }> => {
    const userVoiceLog: VoiceLog = {
      id: `v_u_${Date.now()}`,
      timestamp: new Date().toISOString(),
      speaker: 'user',
      text: transcript,
    };
    setVoiceLogs((prev) => [...prev, userVoiceLog]);

    try {
      const res = await fetch('/api/ai/voice-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          businessContext: {
            type: activeBusiness.category,
            name: activeBusiness.name,
            customers: customers.map((c) => ({ name: c.name, id: c.id, receivable: c.totalReceivable })),
            inventory: products.slice(0, 8).map((p) => ({ name: p.name, price: p.price, stock: p.stock })),
            goldRate: activeBusiness.goldRates ? `Rs. ${activeBusiness.goldRates.rate24k} / tola` : undefined,
          },
        }),
      });

      const json = await res.json();
      const action = json.data || {};
      const responseText =
        action.voiceResponseText ||
        `Maine aapki entry "${transcript}" process kar li hai aur khata update ho gaya hai.`;
      const urduScript = action.urduScript || 'اندراج کامیابی سے محفوظ کر لیا گیا ہے۔';

      // Execute Action
      let actionLabel = '';

      if (action.actionType === 'UPDATE_GOLD_RATE' && action.actionDetails?.goldRate) {
        updateGoldRate(action.actionDetails.goldRate);
        actionLabel = `Updated 24K Gold Rate to Rs. ${action.actionDetails.goldRate.toLocaleString()}`;
      } else if (action.actionType === 'ADD_UDHAAR' && action.actionDetails) {
        const custName = action.actionDetails.customerName || 'Customer';
        const amount = action.actionDetails.amount || 10000;
        const matched = customers.find((c) => c.name.toLowerCase().includes(custName.toLowerCase()));

        if (matched) {
          addCustomerTransaction(matched.id, {
            date: new Date().toISOString(),
            type: 'udhaar_given',
            amount: amount,
            paymentMethod: 'Udhaar',
            notes: action.actionDetails.notes || `Voice entry: "${transcript}"`,
          });
        } else {
          const newCustId = addCustomer({
            name: custName,
            phone: '+92 300 0000000',
            type: 'customer',
            totalReceivable: amount,
            totalPayable: 0,
            notes: `Added via AI Voice: "${transcript}"`,
          });
          addCustomerTransaction(newCustId, {
            date: new Date().toISOString(),
            type: 'udhaar_given',
            amount: amount,
            paymentMethod: 'Udhaar',
            notes: `Voice recorded udhaar`,
          });
        }
        actionLabel = `Added Rs. ${amount.toLocaleString()} Udhaar for ${custName}`;
      } else if (action.actionType === 'RECEIVE_PAYMENT' && action.actionDetails) {
        const custName = action.actionDetails.customerName || 'Customer';
        const amount = action.actionDetails.amount || 10000;
        const matched = customers.find((c) => c.name.toLowerCase().includes(custName.toLowerCase()));

        if (matched) {
          addCustomerTransaction(matched.id, {
            date: new Date().toISOString(),
            type: 'payment_received',
            amount: amount,
            paymentMethod: (action.actionDetails.paymentType as any) || 'Cash',
            notes: `Voice payment wasool: "${transcript}"`,
          });
          actionLabel = `Received Rs. ${amount.toLocaleString()} payment from ${matched.name}`;
        }
      } else if (action.actionType === 'RECORD_SALE' && action.actionDetails) {
        const amount = action.actionDetails.amount || 50000;
        const itemDesc = action.actionDetails.itemDescription || 'Counter Sale';
        recordSale({
          date: new Date().toISOString(),
          customerName: action.actionDetails.customerName || 'Cash Walk-in',
          items: [
            {
              productId: products[0]?.id || 'prod_custom',
              productName: itemDesc,
              quantity: action.actionDetails.quantity || 1,
              unitPrice: amount,
              unit: action.actionDetails.unit || 'Item',
              total: amount,
            },
          ],
          subtotal: amount,
          discount: 0,
          tax: 0,
          totalAmount: amount,
          receivedAmount: amount,
          udhaarAmount: 0,
          paymentMethod: (action.actionDetails.paymentType as any) || 'Cash',
          notes: `Recorded via AI Voice: "${transcript}"`,
          type: activeBusiness.category === 'petrol_pump' ? 'fuel_log' : 'sale',
        });
        actionLabel = `Recorded Sale of Rs. ${amount.toLocaleString()}`;
      } else if (action.actionType === 'RECORD_EXPENSE' && action.actionDetails) {
        const amount = action.actionDetails.amount || 5000;
        addExpense({
          date: new Date().toISOString().split('T')[0],
          category: 'Other',
          amount: amount,
          paymentMethod: 'Cash',
          notes: action.actionDetails.notes || `Voice expense: "${transcript}"`,
        });
        actionLabel = `Recorded Expense of Rs. ${amount.toLocaleString()}`;
      }

      const ayeshaLog: VoiceLog = {
        id: `v_a_${Date.now()}`,
        timestamp: new Date().toISOString(),
        speaker: 'ayesha',
        text: responseText,
        urduText: urduScript,
        actionTaken: actionLabel || undefined,
      };
      setVoiceLogs((prev) => [...prev, ayeshaLog]);

      return {
        success: true,
        voiceResponseText: responseText,
        urduScript,
        actionTaken: actionLabel,
      };
    } catch (err: any) {
      console.error('Error processing voice transcript:', err);
      const fallbackText = `Aapki entry "${transcript}" record ho chuki hai.`;
      setVoiceLogs((prev) => [
        ...prev,
        {
          id: `v_a_${Date.now()}`,
          timestamp: new Date().toISOString(),
          speaker: 'ayesha',
          text: fallbackText,
        },
      ]);
      return { success: true, voiceResponseText: fallbackText };
    }
  };

  // Ask Copilot
  const askAICopilot = async (query: string): Promise<string> => {
    try {
      const todaySales = sales
        .filter((s) => s.date.startsWith(new Date().toISOString().split('T')[0]))
        .reduce((sum, s) => sum + s.totalAmount, 0);

      const monthSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const monthExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalReceivable = customers.reduce((sum, c) => sum + c.totalReceivable, 0);
      const totalPayable = customers.reduce((sum, c) => sum + c.totalPayable, 0);

      const topDebtors = customers
        .filter((c) => c.totalReceivable > 0)
        .sort((a, b) => b.totalReceivable - a.totalReceivable)
        .slice(0, 3)
        .map((c) => ({ name: c.name, receivable: c.totalReceivable, phone: c.phone }));

      const lowStockItems = products
        .filter((p) => p.stock <= (p.minStockAlert || 5))
        .map((p) => ({ name: p.name, stock: p.stock, unit: p.unit }));

      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          businessSnapshot: {
            name: activeBusiness.name,
            type: activeBusiness.category,
            todaySales,
            monthSales,
            monthProfit: Math.max(0, monthSales - monthExpenses),
            totalReceivable,
            totalPayable,
            topDebtors,
            lowStockItems,
            recentSales: sales.slice(0, 5),
            customMetrics: activeBusiness.goldRates || activeBusiness.fuelRates,
          },
        }),
      });

      const json = await res.json();
      return json.answer || 'Aapka sawal process ho gaya hai.';
    } catch (err: any) {
      console.error('Copilot query error:', err);
      return 'Internet connection ya server issue ki wajah se live copilot connect nahi ho saka.';
    }
  };

  // Generate Monthly Report
  const generateMonthlyReport = async () => {
    try {
      const res = await fetch('/api/ai/monthly-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessData: {
            business: activeBusiness,
            salesSummary: {
              totalSales: sales.reduce((sum, s) => sum + s.totalAmount, 0),
              transactionCount: sales.length,
            },
            expenseSummary: {
              totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
              categories: expenses.map((e) => ({ category: e.category, amount: e.amount })),
            },
            creditSummary: {
              totalReceivable: customers.reduce((sum, c) => sum + c.totalReceivable, 0),
              overdueAccounts: customers.filter((c) => c.totalReceivable > 50000).length,
            },
            inventorySummary: {
              totalItems: products.length,
              lowStockCount: products.filter((p) => p.stock <= (p.minStockAlert || 5)).length,
            },
          },
        }),
      });
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error('Monthly report error:', err);
      return null;
    }
  };

  // Export JSON
  const exportDataJson = () => {
    const payload = {
      businesses,
      products: allProducts,
      customers: allCustomers,
      sales: allSales,
      expenses: allExpenses,
      insights: allInsights,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Khata_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importDataJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.businesses) setBusinesses(data.businesses);
      if (data.products) setAllProducts(data.products);
      if (data.customers) setAllCustomers(data.customers);
      if (data.sales) setAllSales(data.sales);
      if (data.expenses) setAllExpenses(data.expenses);
      if (data.insights) setAllInsights(data.insights);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  // Reset to initial seed
  const resetToDefaults = () => {
    setBusinesses(INITIAL_BUSINESSES);
    setActiveBizId(INITIAL_BUSINESSES[0].id);
    setAllProducts(INITIAL_PRODUCTS);
    setAllCustomers(INITIAL_CUSTOMERS);
    setAllSales(INITIAL_TRANSACTIONS);
    setAllExpenses(INITIAL_EXPENSES);
    setAllInsights(INITIAL_INSIGHTS);
    setUserRole('owner');
    localStorage.clear();
  };

  return (
    <KhataContext.Provider
      value={{
        businesses,
        activeBusiness,
        switchBusiness,
        addNewBusiness,
        updateBusiness,
        deleteBusiness,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        renameCategory,
        adjustStock,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addCustomerTransaction,
        sales,
        recordSale,
        expenses,
        addExpense,
        insights,
        dismissInsight,
        voiceLogs,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
        processVoiceTranscript,
        askAICopilot,
        generateMonthlyReport,
        updateGoldRate,
        updateFuelRates,
        userRole,
        setUserRole,
        isOnboardingOpen,
        setIsOnboardingOpen,
        exportDataJson,
        importDataJson,
        resetToDefaults,
      }}
    >
      {children}
    </KhataContext.Provider>
  );
};

export const useKhata = () => {
  const context = useContext(KhataContext);
  if (!context) {
    throw new Error('useKhata must be used within a KhataProvider');
  }
  return context;
};
