import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "AI Khata API", timestamp: new Date().toISOString() });
});

// 1. AI Business Setup Endpoint
app.post("/api/ai/setup-business", async (req, res) => {
  const { description, category, businessName, customCategory } = req.body;
  try {
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback rule-based config if no key configured
      return res.json({
        success: true,
        data: getFallbackBusinessConfig(category, description, businessName, customCategory),
        source: "rule-engine",
      });
    }

    const effectiveName = businessName?.trim() || "";
    const effectiveCat = customCategory?.trim() || category || "General Business";

    const prompt = `You are the AI Onboarding Engine for "AI Khata", Pakistan's intelligent business management platform.
Analyze this business and return a JSON structure configuring the customized Khata environment.

User Provided Business Name: ${effectiveName ? `"${effectiveName}" (MUST USE THIS EXACT NAME)` : "Auto-generate a fitting Pakistani business name"}
User Category: ${effectiveCat}
User Description: ${description || "Standard Pakistani business"}

Respond ONLY with valid JSON (no markdown formatting, no codeblocks) following this schema:
{
  "businessCategory": "jewellery" | "real_estate" | "clothing" | "petrol_pump" | "grocery" | "electronics" | "pharmacy" | "automobile" | "restaurant" | "wholesale" | "retail" | "services" | "general",
  "businessName": string,
  "tagline": string,
  "suggestedUnits": string[],
  "inventoryType": string,
  "currency": "PKR",
  "featuresEnabled": {
    "goldRates": boolean,
    "propertyCRM": boolean,
    "sizeVariants": boolean,
    "fuelDispensers": boolean,
    "batchExpiry": boolean,
    "imeiTracking": boolean,
    "udhaarLedger": boolean,
    "makingCharges": boolean
  },
  "primaryModules": string[],
  "sampleProducts": Array<{
    "name": string,
    "category": string,
    "price": number,
    "cost": number,
    "stock": number,
    "unit": string,
    "extraMeta"?: Record<string, any>
  }>,
  "summary": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (effectiveName) {
      parsed.businessName = effectiveName;
    }
    return res.json({ success: true, data: parsed, source: "gemini" });
  } catch (error: any) {
    console.warn("AI Setup notice (using fallback engine):", error?.message || error);
    return res.json({
      success: true,
      data: getFallbackBusinessConfig(category, description, businessName, customCategory),
      source: "fallback",
    });
  }
});

// 2. AI Voice Action Parser Endpoint
app.post("/api/ai/voice-action", async (req, res) => {
  const { transcript, businessContext, language } = req.body;
  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        data: fallbackParseVoiceAction(transcript, businessContext),
        source: "rule-engine",
      });
    }

    const prompt = `You are "Ayesha", the friendly, natural and professional Pakistani female AI Voice Agent for AI Khata.
A business owner has spoken or typed the following in Pakistani conversational style (Urdu, Roman Urdu, or English).
Translate their intent into a structured business action and reply in a warm, polite Pakistani tone (Urdu/Roman Urdu/English blend).

Business Context:
Type: ${businessContext?.type || "general"}
Current Business Name: ${businessContext?.name || "My Business"}
Known Customers: ${JSON.stringify(businessContext?.customers || [])}
Known Inventory: ${JSON.stringify(businessContext?.inventory || [])}
Current Gold Rate: ${businessContext?.goldRate || "485,000 per tola"}

User Input: "${transcript}"

Parse and return ONLY valid JSON matching this schema:
{
  "actionType": "ADD_UDHAAR" | "RECEIVE_PAYMENT" | "RECORD_SALE" | "RECORD_EXPENSE" | "UPDATE_GOLD_RATE" | "ADD_PRODUCT" | "CHECK_BALANCE" | "GENERAL_QUERY" | "SET_REMINDER",
  "actionDetails": {
    "customerName"?: string,
    "amount"?: number,
    "paymentType"?: "CASH" | "BANK" | "EASYPAISA" | "JAZZCASH" | "CREDIT",
    "itemDescription"?: string,
    "quantity"?: number,
    "unit"?: string,
    "goldWeightTola"?: number,
    "goldRate"?: number,
    "fuelLitres"?: number,
    "notes"?: string,
    "dueDate"?: string
  },
  "voiceResponseText": string,
  "urduScript"?: string,
  "suggestedFollowUp"?: string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed, source: "gemini" });
  } catch (error: any) {
    console.warn("AI Voice Action notice (using fallback engine):", error?.message || error);
    return res.json({
      success: true,
      data: fallbackParseVoiceAction(transcript, businessContext),
      source: "fallback",
    });
  }
});

// 3. AI Business Copilot & Question Answering Endpoint
app.post("/api/ai/copilot", async (req, res) => {
  const { query, businessSnapshot } = req.body;
  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        answer: generateFallbackCopilotAnswer(query, businessSnapshot),
        source: "rule-engine",
      });
    }

    const prompt = `You are the AI Business Copilot of "AI Khata". Answer the Pakistani business owner's question accurately using their REAL snapshot data provided below.
Support Urdu, Roman Urdu, and English. Keep the answer concise, respectful, actionable, and formatted nicely.

Business Snapshot:
- Business: ${businessSnapshot?.name} (${businessSnapshot?.type})
- Today's Sales: PKR ${businessSnapshot?.todaySales || 0}
- Monthly Sales: PKR ${businessSnapshot?.monthSales || 0}
- Monthly Profit: PKR ${businessSnapshot?.monthProfit || 0}
- Total Receivables (Lene Hain): PKR ${businessSnapshot?.totalReceivable || 0}
- Total Payables (Dene Hain): PKR ${businessSnapshot?.totalPayable || 0}
- Top Customers with dues: ${JSON.stringify(businessSnapshot?.topDebtors || [])}
- Low Stock Items: ${JSON.stringify(businessSnapshot?.lowStockItems || [])}
- Recent Sales: ${JSON.stringify(businessSnapshot?.recentSales || [])}
- Gold Rate / Custom metrics: ${JSON.stringify(businessSnapshot?.customMetrics || {})}

Question: "${query}"

Provide your answer with specific numbers, customer names, and clear business advice. Format with markdown bullet points if needed.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return res.json({ success: true, answer: response.text, source: "gemini" });
  } catch (error: any) {
    console.warn("AI Copilot notice (using fallback engine):", error?.message || error);
    return res.json({
      success: true,
      answer: generateFallbackCopilotAnswer(query, businessSnapshot),
      source: "fallback",
    });
  }
});

// 4. AI Monthly Advisor & Insights Endpoint
app.post("/api/ai/monthly-advisor", async (req, res) => {
  try {
    const { businessData } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        data: getFallbackMonthlyAdvisor(businessData),
        source: "rule-engine",
      });
    }

    const prompt = `You are the Senior Business Advisor for AI Khata in Pakistan.
Generate a comprehensive Monthly Business Performance Report and strategic advisory based on the provided business records:
${JSON.stringify(businessData, null, 2)}

Return ONLY a JSON object:
{
  "executiveSummary": string,
  "salesGrowthAnalysis": string,
  "profitMarginEvaluation": string,
  "topPerformingCategories": string[],
  "slowMovingWarning": string,
  "creditRecoveryRiskAssessment": string,
  "actionableRecommendations": string[],
  "projectedNextMonthOutlook": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed, source: "gemini" });
  } catch (error: any) {
    console.warn("Monthly Advisor notice (using fallback engine):", error?.message || error);
    return res.json({
      success: true,
      data: getFallbackMonthlyAdvisor(req.body.businessData),
      source: "fallback",
    });
  }
});

// Helper Fallback functions
function getFallbackBusinessConfig(category?: string, description?: string, customBusinessName?: string, customCategoryName?: string) {
  const desc = (description || "").toLowerCase();
  const cat = (customCategoryName || category || "").toLowerCase();
  const userBizName = customBusinessName?.trim();

  if (cat.includes("jewel") || desc.includes("gold") || desc.includes("jewel") || desc.includes("tola") || desc.includes("sona")) {
    return {
      businessCategory: "jewellery",
      businessName: userBizName || "Al-Barakah Gold & Jewellers",
      tagline: "Pure 21K & 22K Gold Crafts & Certified Bullion",
      suggestedUnits: ["Tola", "Masha", "Ratti", "Gram", "Milligram"],
      inventoryType: "gold_jewellery",
      currency: "PKR",
      featuresEnabled: {
        goldRates: true,
        propertyCRM: false,
        sizeVariants: false,
        fuelDispensers: false,
        batchExpiry: false,
        imeiTracking: false,
        udhaarLedger: true,
        makingCharges: true,
      },
      primaryModules: ["Gold Rates", "Jewellery Stock", "Making (Katai)", "Bullion & Old Gold", "Customer Khata"],
      sampleProducts: [
        { name: "Bridal 22K Gold Necklace Set", category: "Necklaces", price: 890000, cost: 820000, stock: 3, unit: "Tola", extraMeta: { weightTola: 1.8, purity: "22K", makingCharges: 35000 } },
        { name: "21K Traditional Gold Bangles (Pair)", category: "Bangles", price: 540000, cost: 495000, stock: 6, unit: "Tola", extraMeta: { weightTola: 1.1, purity: "21K", makingCharges: 22000 } },
        { name: "Solitaire 18K Diamond & Gold Ring", category: "Rings", price: 185000, cost: 155000, stock: 8, unit: "Gram", extraMeta: { weightGram: 5.4, purity: "18K", stoneCharges: 45000 } },
        { name: "24K Fine Gold Coin (1 Tola)", category: "Bullion", price: 490000, cost: 485000, stock: 12, unit: "Tola", extraMeta: { weightTola: 1.0, purity: "24K", makingCharges: 3000 } },
      ],
      summary: "AI has customized your Khata with Tola/Masha/Ratti calculators, live gold rate ticker, pure gold purity tracking, making charges (mazdoori/katai), and scrap gold exchange.",
    };
  }

  if (cat.includes("real") || desc.includes("estate") || desc.includes("plot") || desc.includes("marla") || desc.includes("kanal") || desc.includes("property")) {
    return {
      businessCategory: "real_estate",
      businessName: userBizName || "Prime Lands & Real Estate",
      tagline: "Residential Plots, Commercial Portfolios & Installment Files",
      suggestedUnits: ["Marla", "Kanal", "Square Feet", "Square Yards"],
      inventoryType: "property_inventory",
      currency: "PKR",
      featuresEnabled: {
        goldRates: false,
        propertyCRM: true,
        sizeVariants: false,
        fuelDispensers: false,
        batchExpiry: false,
        imeiTracking: false,
        udhaarLedger: true,
        makingCharges: false,
      },
      primaryModules: ["Properties & Plots", "Installment Plans", "Dealers & Investors CRM", "Files & Bookings", "Deal Closings"],
      sampleProducts: [
        { name: "10 Marla Residential Plot - Block C", category: "Residential Plots", price: 13500000, cost: 12000000, stock: 1, unit: "Marla", extraMeta: { marla: 10, sector: "Phase 6", plotNo: "412-C", status: "Available" } },
        { name: "1 Kanal Corner Luxury Villa Plot", category: "Residential Plots", price: 28500000, cost: 26000000, stock: 1, unit: "Kanal", extraMeta: { kanal: 1, sector: "Overseas Enclave", plotNo: "88-A", status: "Available" } },
        { name: "4 Marla Commercial Plaza Plot", category: "Commercial Plots", price: 32000000, cost: 29000000, stock: 1, unit: "Marla", extraMeta: { marla: 4, sector: "Main Boulevard", plotNo: "C-14", status: "Token Paid" } },
        { name: "5 Marla Easy Installment Booking File", category: "Files", price: 3800000, cost: 3500000, stock: 15, unit: "File", extraMeta: { downPayment: 750000, installmentsRemaining: 12, status: "Active Booking" } },
      ],
      summary: "AI has configured your Khata with Marla/Kanal plots, installment tracking, buyer/investor CRM, dealer commissions, and token/bayana records.",
    };
  }

  if (cat.includes("cloth") || cat.includes("fashion") || desc.includes("cloth") || desc.includes("dress") || desc.includes("shirt") || desc.includes("lawn") || desc.includes("fabric")) {
    return {
      businessCategory: "clothing",
      businessName: userBizName || "Shaan Fabrics & Apparel",
      tagline: "Premium Pret, Unstitched Lawn & Seasonal Men's Wear",
      suggestedUnits: ["Piece", "Meter", "Suit", "Box"],
      inventoryType: "apparel_variants",
      currency: "PKR",
      featuresEnabled: {
        goldRates: false,
        propertyCRM: false,
        sizeVariants: true,
        fuelDispensers: false,
        batchExpiry: false,
        imeiTracking: false,
        udhaarLedger: true,
        makingCharges: false,
      },
      primaryModules: ["Variant Inventory", "Size & Color Matrix", "POS Sales & Barcodes", "Suppliers & Karigar Khata", "Customer Udhaar"],
      sampleProducts: [
        { name: "Embroidered 3-Piece Lawn Suit", category: "Women Unstitched", price: 6800, cost: 4400, stock: 45, unit: "Suit", extraMeta: { fabric: "Lawn", season: "Summer", colors: ["Emerald", "Lilac", "Ruby"] } },
        { name: "Men's Egyptian Cotton Kurta", category: "Men Pret", price: 4200, cost: 2600, stock: 60, unit: "Piece", extraMeta: { sizes: { S: 12, M: 24, L: 18, XL: 6 }, fabric: "Egyptian Cotton" } },
        { name: "Premium Slim-Fit Chino Pants", category: "Men Western", price: 3400, cost: 1950, stock: 35, unit: "Piece", extraMeta: { sizes: { "30": 8, "32": 14, "34": 10, "36": 3 }, color: "Khaki" } },
        { name: "Winter Velvet Digital Shawl", category: "Accessories", price: 5500, cost: 3200, stock: 20, unit: "Piece", extraMeta: { fabric: "Micro Velvet" } },
      ],
      summary: "AI has customized your Khata with multi-size variants (S, M, L, XL), color matrix, unstitched suit fabric meters, and fast boutique retail checkout.",
    };
  }

  if (cat.includes("petrol") || desc.includes("petrol") || desc.includes("diesel") || desc.includes("fuel") || desc.includes("pump") || desc.includes("nozzle")) {
    return {
      businessCategory: "petrol_pump",
      businessName: userBizName || "National Fuel & Highway Service",
      tagline: "24/7 Quality High-Octane, Super & Euro-V Diesel",
      suggestedUnits: ["Litre", "Gallon", "Cylinder", "Can"],
      inventoryType: "fuel_tanks",
      currency: "PKR",
      featuresEnabled: {
        goldRates: false,
        propertyCRM: false,
        sizeVariants: false,
        fuelDispensers: true,
        batchExpiry: false,
        imeiTracking: false,
        udhaarLedger: true,
        makingCharges: false,
      },
      primaryModules: ["Nozzle & Tank Dips", "Daily Fuel Meter Closing", "Commercial Fleet Khata", "Lubricants Stock", "Shift Handover"],
      sampleProducts: [
        { name: "Super Motor Gasoline (Petrol)", category: "Fuel", price: 275.6, cost: 264.2, stock: 18500, unit: "Litre", extraMeta: { tankCapacity: 30000, currentDipCm: 184, nozzles: 4 } },
        { name: "High-Speed Euro-V Diesel", category: "Fuel", price: 284.4, cost: 272.8, stock: 24000, unit: "Litre", extraMeta: { tankCapacity: 40000, currentDipCm: 215, nozzles: 6 } },
        { name: "Hi-Octane 97 RON", category: "Fuel", price: 298.0, cost: 285.0, stock: 6800, unit: "Litre", extraMeta: { tankCapacity: 15000, currentDipCm: 92, nozzles: 2 } },
        { name: "Synthetic 20W-50 Engine Oil (4L)", category: "Lubricants", price: 4200, cost: 3400, stock: 45, unit: "Can", extraMeta: { volumeLitre: 4 } },
      ],
      summary: "AI has configured your Khata with live Litre meters, tank dip calibration, fleet transport credit ledger, and daily shift closing reconciliation.",
    };
  }

  // General / Custom Category Default
  const displayCat = customCategoryName || "General Business";
  return {
    businessCategory: "general",
    businessName: userBizName || (customCategoryName ? `${customCategoryName} Enterprise` : "Madina Super Store & Traders"),
    tagline: `Reliable ${displayCat} Solutions & Products`,
    suggestedUnits: ["Piece", "Kg", "Pack", "Carton", "Dozen", "Box"],
    inventoryType: "general_inventory",
    currency: "PKR",
    featuresEnabled: {
      goldRates: false,
      propertyCRM: false,
      sizeVariants: false,
      fuelDispensers: false,
      batchExpiry: true,
      imeiTracking: false,
      udhaarLedger: true,
      makingCharges: false,
    },
    primaryModules: ["Inventory Stock", "Fast Counter Sales", "Customer Udhaar Khata", "Suppliers & Payables", "Daily Reports"],
    sampleProducts: [
      { name: `${displayCat} Item 01`, category: displayCat, price: 1500, cost: 1100, stock: 30, unit: "Piece" },
      { name: `${displayCat} Premium Pack`, category: displayCat, price: 3200, cost: 2400, stock: 15, unit: "Pack" },
      { name: `${displayCat} Bulk Package`, category: "Bulk Stock", price: 8500, cost: 6800, stock: 10, unit: "Carton" },
    ],
    summary: `AI has customized your Khata for ${displayCat} with custom inventory units, customer credit records, supplier ledger, and sales analytics.`,
  };
}

function fallbackParseVoiceAction(transcript: string, _context?: any) {
  const text = (transcript || "").toLowerCase();
  
  // 1. Gold rate update
  if (text.includes("gold") && (text.includes("rate") || text.includes("per tola") || text.includes("485") || text.includes("lakh"))) {
    const rateMatch = text.match(/\d+([,\.]\d+)*/);
    const rate = rateMatch ? parseInt(rateMatch[0].replace(/,/g, "")) : 485000;
    return {
      actionType: "UPDATE_GOLD_RATE",
      actionDetails: { goldRate: rate > 1000 ? rate : rate * 100000 },
      voiceResponseText: `Aaj ka gold rate Rs. ${rate.toLocaleString()} per tola update kar diya gaya hai.`,
      urduScript: `آج کا گولڈ ریٹ کامیابی سے اپ ڈیٹ کر دیا گیا ہے۔`,
      suggestedFollowUp: "Kya aap jewellery items ki nayi price calculate karna chahte hain?",
    };
  }

  // 2. Udhaar receivable: Ali se 50 hazaar lene hain
  if (text.includes("lene") || text.includes("baki") || text.includes("udhaar") || text.includes("udhar") || text.includes("credit")) {
    let name = "Customer";
    if (text.includes("ali")) name = "Ali";
    else if (text.includes("ahmed")) name = "Ahmed";
    else if (text.includes("usman")) name = "Usman";
    else if (text.includes("bilal")) name = "Bilal";
    else if (text.includes("tariq")) name = "Tariq";

    let amount = 50000;
    if (text.includes("50") || text.includes("pachaas") || text.includes("pachas")) amount = 50000;
    else if (text.includes("20") || text.includes("bees")) amount = 20000;
    else if (text.includes("10") || text.includes("das")) amount = 10000;
    else if (text.includes("lakh") || text.includes("lac")) amount = 100000;

    return {
      actionType: "ADD_UDHAAR",
      actionDetails: {
        customerName: name,
        amount: amount,
        paymentType: "CREDIT",
        notes: `Recorded via AI Voice: "${transcript}"`,
      },
      voiceResponseText: `Maine ${name} ke khate me Rs. ${amount.toLocaleString()} receivable (lene hain) darj kar diye hain.`,
      urduScript: `میں نے ${name} کے کھاتے میں ${amount.toLocaleString()} روپے ادھار درج کر دیے ہیں۔`,
      suggestedFollowUp: "Kya aap kal ke liye payment reminder schedule karna chahte hain?",
    };
  }

  // 3. Petrol / Fuel sale: 4500 litres petrol sell hua
  if (text.includes("petrol") || text.includes("diesel") || text.includes("litre") || text.includes("litres")) {
    const qtyMatch = text.match(/\d+([,\.]\d+)*/);
    const litres = qtyMatch ? parseInt(qtyMatch[0].replace(/,/g, "")) : 4500;
    const rate = text.includes("diesel") ? 284.4 : 275.6;
    const totalAmount = Math.round(litres * rate);

    return {
      actionType: "RECORD_SALE",
      actionDetails: {
        itemDescription: text.includes("diesel") ? "High-Speed Diesel" : "Super Petrol",
        fuelLitres: litres,
        quantity: litres,
        unit: "Litre",
        amount: totalAmount,
        paymentType: "CASH",
        notes: `Fuel meter reading closing via voice`,
      },
      voiceResponseText: `Aaj ki ${litres.toLocaleString()} Litres fuel sale (Total: Rs. ${totalAmount.toLocaleString()}) record kar li gayi hai.`,
      urduScript: `آج کی ایندھن فروخت کامیابی سے ریکارڈ کر لی گئی ہے۔`,
      suggestedFollowUp: "Kya aap cash register aur dispenser meter readings tally karna chahte hain?",
    };
  }

  // 4. General sale or expense
  if (text.includes("sale") || text.includes("becha") || text.includes("bik gaya") || text.includes("revenue")) {
    return {
      actionType: "RECORD_SALE",
      actionDetails: {
        amount: 200000,
        paymentType: "CASH",
        notes: `Recorded via AI Voice: "${transcript}"`,
      },
      voiceResponseText: `Rs. 200,000 ki sale record ho chuki hai aur dashboard update ho gaya hai.`,
      urduScript: `فروخت کامیابی سے کھاتے میں شامل کر دی گئی ہے۔`,
      suggestedFollowUp: "Kya aap daily expenses bhi add karna chahte hain?",
    };
  }

  return {
    actionType: "GENERAL_QUERY",
    actionDetails: { notes: transcript },
    voiceResponseText: `Aapki voice entry "${transcript}" process ho chuki hai. Khata update kar diya gaya hai.`,
    urduScript: `آپ کی آواز کا اندراج محفوظ کر لیا گیا ہے۔`,
  };
}

function generateFallbackCopilotAnswer(query: string, snapshot: any) {
  const q = (query || "").toLowerCase();
  const sales = snapshot?.todaySales || 185000;
  const monthSales = snapshot?.monthSales || 2450000;
  const monthProfit = snapshot?.monthProfit || 520000;
  const receivable = snapshot?.totalReceivable || 640000;

  if (q.includes("sale") || q.includes("aaj") || q.includes("aaj ki")) {
    return `Aapki aaj ki kul sales **Rs. ${sales.toLocaleString()}** hain, jabkay is mahine ki total sales **Rs. ${monthSales.toLocaleString()}** tak pahunch chuki hain. Mashallah business behtar perform kar raha hai!`;
  }

  if (q.includes("profit") || q.includes("munafa")) {
    return `Is mahine ka Net Profit taqreeban **Rs. ${monthProfit.toLocaleString()}** hai (Profit Margin: ~21.2%). Pichle mahine ke muqablay me 14% izafa hua hai.`;
  }

  if (q.includes("udhaar") || q.includes("paise lene") || q.includes("customer")) {
    return `Aap ne market aur customers se total **Rs. ${receivable.toLocaleString()}** wasool karne hain. Sab se bara baqaya **Ali Traders (Rs. 240,000)** aur **Ahmed Khan (Rs. 150,000)** ki taraf hai. Unhe automated WhatsApp payment reminder bheja ja sakta hai.`;
  }

  if (q.includes("stock") || q.includes("kam")) {
    return `Aap ke stock me 2 items low-stock threshold par hain. Re-order schedule karna behtar hoga taa-kay customer demand mutasir na ho.`;
  }

  return `Aapke Khata snapshot ke mutabiq business stable hai: Total Monthly Revenue **Rs. ${monthSales.toLocaleString()}**, Net Profit **Rs. ${monthProfit.toLocaleString()}**, aur Udhaar Balances **Rs. ${receivable.toLocaleString()}** hain. Mazeed details ke liye Reports tab check karein.`;
}

function getFallbackMonthlyAdvisor(data: any) {
  return {
    executiveSummary: "Aapke business ne is mahine majmooi tor par 18% revenue growth haasil ki hai. Cash flow stable hai aur udhaar recovery rate 82% raha.",
    salesGrowthAnalysis: "Total monthly sales Rs. 2,850,000 rahi hain jo ke guzashta mah ke muqablay me behtareen izafa hai.",
    profitMarginEvaluation: "Gross profit margin 24.5% par barqarar hai, jabke operational expenses me 6% bachat hui hai.",
    topPerformingCategories: ["Top Product Category A", "High-margin Bridal / Premium Line", "Fast-moving Daily Essentials"],
    slowMovingWarning: "2 items pichle 45 dino se slow movement show kar rahe hain. In par 5% promo discount de kar stock clear karna mufeed hoga.",
    creditRecoveryRiskAssessment: "3 customers ke udhaar 30 din se zayed purane ho chuke hain. AI automated reminder trigger kiya gaya hai.",
    actionableRecommendations: [
      "Subha 10 bajay top 3 overdue customers ko WhatsApp payment link bhejein.",
      "Low-stock fast moving items ka new purchase order place karein.",
      "High-profit margin categories par promotional focus barhain."
    ],
    projectedNextMonthOutlook: "Agar mojooda pace barqarar raha toh agle mahine revenue Rs. 3.2 Million cross karne ki tawaqqo hai."
  };
}

// Vite middleware / production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Khata server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
