import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessProfile, SaleTransaction, ExpenseRecord, Customer, ProductItem } from '../types';

export function downloadFinancialCSV(
  business: BusinessProfile,
  sales: SaleTransaction[],
  expenses: ExpenseRecord[],
  customers: Customer[],
  products: ProductItem[]
) {
  const dateStr = new Date().toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReceived = sales.reduce((sum, s) => sum + s.receivedAmount, 0);
  const totalUdhaarGiven = sales.reduce((sum, s) => sum + s.udhaarAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const totalReceivables = customers.reduce((sum, c) => sum + c.totalReceivable, 0);
  const totalInventoryValuation = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const lines: string[] = [];

  // Title & Metadata
  lines.push(`"BUSINESS FINANCIAL & ACCOUNTING REPORT"`);
  lines.push(`"Business Name:","${business.name}"`);
  lines.push(`"Tagline / Details:","${business.tagline || 'N/A'}"`);
  lines.push(`"Category:","${(business.customCategoryName || business.category.replace('_', ' ')).toUpperCase()}"`);
  lines.push(`"Phone:","${business.phone || 'N/A'}"`);
  lines.push(`"Address:","${business.address || 'N/A'}"`);
  lines.push(`"Report Generated Date:","${dateStr}"`);
  lines.push('');

  // Executive Summary Table
  lines.push(`"--- EXECUTIVE FINANCIAL SUMMARY ---"`);
  lines.push(`"Metric","Amount (PKR)","Notes"`);
  lines.push(`"Total Sales Revenue","${totalSales}","Gross sales recorded"`);
  lines.push(`"Total Cash/Online Received","${totalReceived}","Liquid revenue received"`);
  lines.push(`"Total Sales Udhaar Given","${totalUdhaarGiven}","Credit extended in sales"`);
  lines.push(`"Total Operating Expenses","${totalExpenses}","Salaries, rent, utilities, etc."`);
  lines.push(`"Net Realized Profit / (Loss)","${netProfit}","Sales Revenue minus Expenses"`);
  lines.push(`"Total Outstanding Receivables (Udhaar Lene Hain)","${totalReceivables}","Active customer credit balance"`);
  lines.push(`"Total Inventory Asset Valuation","${totalInventoryValuation}","Stock quantity x Selling price"`);
  lines.push('');

  // Section 1: Sales Transactions
  lines.push(`"--- SALES TRANSACTIONS LEDGER ---"`);
  lines.push(`"Sale ID","Date","Customer Name","Phone","Payment Method","Subtotal (PKR)","Discount (PKR)","Total Amount (PKR)","Received (PKR)","Udhaar (PKR)","Items Summary"`);
  sales.forEach((s) => {
    const itemsSummary = s.items
      ? s.items.map((i) => `${i.productName} (x${i.quantity} ${i.unit})`).join('; ')
      : 'N/A';
    lines.push(
      `"${s.id}","${s.date}","${(s.customerName || 'Walk-in').replace(/"/g, '""')}","${s.customerPhone || ''}","${s.paymentMethod}","${s.subtotal}","${s.discount}","${s.totalAmount}","${s.receivedAmount}","${s.udhaarAmount}","${itemsSummary.replace(/"/g, '""')}"`
    );
  });
  lines.push('');

  // Section 2: Expense Records
  lines.push(`"--- OPERATING EXPENSES LEDGER ---"`);
  lines.push(`"Expense ID","Date","Category","Paid To","Payment Method","Amount (PKR)","Notes"`);
  expenses.forEach((e) => {
    lines.push(
      `"${e.id}","${e.date}","${e.category}","${(e.paidTo || '').replace(/"/g, '""')}","${e.paymentMethod}","${e.amount}","${(e.notes || '').replace(/"/g, '""')}"`
    );
  });
  lines.push('');

  // Section 3: Customer Udhaar Ledger
  lines.push(`"--- CUSTOMER & SUPPLIER UDHAAR BALANCES ---"`);
  lines.push(`"Customer ID","Name","Phone","Type","Receivable / Lene Hain (PKR)","Payable / Dene Hain (PKR)","Due Date","Notes"`);
  customers.forEach((c) => {
    lines.push(
      `"${c.id}","${c.name.replace(/"/g, '""')}","${c.phone}","${c.type}","${c.totalReceivable}","${c.totalPayable}","${c.dueDate || 'N/A'}","${(c.notes || '').replace(/"/g, '""')}"`
    );
  });
  lines.push('');

  // Section 4: Inventory Valuation
  lines.push(`"--- INVENTORY ASSETS & STOCK REGISTER ---"`);
  lines.push(`"Item SKU","Product Name","Category","Stock Qty","Unit","Cost Price (PKR)","Selling Price (PKR)","Total Asset Value (PKR)"`);
  products.forEach((p) => {
    lines.push(
      `"${p.sku || p.id}","${p.name.replace(/"/g, '""')}","${p.category}","${p.stock}","${p.unit}","${p.cost || 0}","${p.price}","${p.price * p.stock}"`
    );
  });

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = `${business.name.replace(/\s+/g, '_')}_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadFinancialPDF(
  business: BusinessProfile,
  sales: SaleTransaction[],
  expenses: ExpenseRecord[],
  customers: Customer[],
  products: ProductItem[],
  aiReport?: any
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // #0F172A slate-900
  const emeraldColor = [16, 185, 129]; // #10B981 emerald-500
  const mutedText = [100, 116, 139]; // slate-500

  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReceived = sales.reduce((sum, s) => sum + s.receivedAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const totalReceivables = customers.reduce((sum, c) => sum + c.totalReceivable, 0);
  const totalStockValuation = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const formattedDate = new Date().toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');

  // Business Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(business.name, 14, 15);

  // Business Tagline / Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  const displayCat = (business.customCategoryName || business.category.replace('_', ' ')).toUpperCase();
  const subtitle = `${business.tagline || 'Business Management & Digital Ledger'} • ${displayCat}`;
  doc.text(subtitle, 14, 21);

  // Address & Phone
  const contact = `Phone: ${business.phone || 'N/A'} | Location: ${business.address || 'Pakistan'}`;
  doc.text(contact, 14, 27);

  // Report Date & Label on Right
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('FINANCIAL STATEMENT', 196, 15, { align: 'right' });

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Generated: ${formattedDate}`, 196, 21, { align: 'right' });
  doc.text(`Type: Official Accounting Audit`, 196, 27, { align: 'right' });

  let currentY = 46;

  // Key Financial Metrics Summary Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Executive Financial Summary', 14, currentY);
  currentY += 4;

  const summaryData = [
    ['Total Gross Sales Revenue', `PKR ${totalSales.toLocaleString()}`, 'Total booked revenue from sales'],
    ['Realized Cash / Online Received', `PKR ${totalReceived.toLocaleString()}`, 'Liquid payment collected'],
    ['Operating Expenses (Salaries/Rent/Utility)', `PKR ${totalExpenses.toLocaleString()}`, 'Recorded business costs'],
    ['Net Realized Profit / (Loss)', `PKR ${netProfit.toLocaleString()}`, netProfit >= 0 ? 'Operating Surplus' : 'Operating Deficit'],
    ['Outstanding Accounts Receivable (Udhaar Lene Hain)', `PKR ${totalReceivables.toLocaleString()}`, 'Customer credit awaiting recovery'],
    ['Total Inventory Valuation (Asset Base)', `PKR ${totalStockValuation.toLocaleString()}`, 'Current retail stock value'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Financial Metric', 'Amount (PKR)', 'Accounting Description']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { fontStyle: 'bold', halign: 'right', cellWidth: 45, textColor: [16, 185, 129] },
      2: { cellWidth: 75, textColor: mutedText as [number, number, number] },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 2: Recent Sales Records
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Recent Sales Ledger', 14, currentY);
  currentY += 4;

  const salesTableData = sales.slice(0, 15).map((s) => [
    s.date,
    s.customerName || 'Walk-in Customer',
    s.paymentMethod,
    `PKR ${s.totalAmount.toLocaleString()}`,
    `PKR ${s.receivedAmount.toLocaleString()}`,
    `PKR ${s.udhaarAmount.toLocaleString()}`,
  ]);

  if (salesTableData.length === 0) {
    salesTableData.push(['-', 'No sales recorded yet', '-', 'PKR 0', 'PKR 0', 'PKR 0']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Customer / Entity', 'Payment Mode', 'Total Amount', 'Received', 'Udhaar']],
    body: salesTableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right', textColor: [16, 185, 129] },
      5: { halign: 'right', textColor: [225, 29, 72] },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check page overflow for Expenses section
  if (currentY > 230) {
    doc.addPage();
    currentY = 16;
  }

  // Section 3: Operating Expenses
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Operating Expense Details', 14, currentY);
  currentY += 4;

  const expenseTableData = expenses.slice(0, 15).map((e) => [
    e.date,
    e.category,
    e.paidTo || '-',
    e.paymentMethod,
    `PKR ${e.amount.toLocaleString()}`,
  ]);

  if (expenseTableData.length === 0) {
    expenseTableData.push(['-', 'No expenses logged', '-', '-', 'PKR 0']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Expense Category', 'Paid To / Vendor', 'Payment Mode', 'Amount']],
    body: expenseTableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold', textColor: [225, 29, 72] },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check page overflow for Customer Udhaar balances
  if (currentY > 230) {
    doc.addPage();
    currentY = 16;
  }

  // Section 4: Customer Udhaar Balances
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Customer Receivables & Udhaar Status', 14, currentY);
  currentY += 4;

  const customerTableData = customers
    .filter((c) => c.totalReceivable > 0 || c.totalPayable > 0)
    .slice(0, 15)
    .map((c) => [
      c.name,
      c.phone || '-',
      c.type.toUpperCase(),
      `PKR ${c.totalReceivable.toLocaleString()}`,
      `PKR ${c.totalPayable.toLocaleString()}`,
      c.dueDate || 'Standard',
    ]);

  if (customerTableData.length === 0) {
    customerTableData.push(['No pending receivables', '-', '-', 'PKR 0', 'PKR 0', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Customer / Entity', 'Phone', 'Role', 'Receivable (Lene Hain)', 'Payable (Dene Hain)', 'Due Date']],
    body: customerTableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold', textColor: [225, 29, 72] },
      4: { halign: 'right', textColor: [16, 185, 129] },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 5: AI Strategic Insights (if present)
  if (aiReport) {
    if (currentY > 220) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('5. AI Executive Analysis & Strategy', 14, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    if (aiReport.executiveSummary) {
      const splitSummary = doc.splitTextToSize(`Summary: ${aiReport.executiveSummary}`, 182);
      doc.text(splitSummary, 14, currentY);
      currentY += splitSummary.length * 4 + 3;
    }

    if (aiReport.actionItems && aiReport.actionItems.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Recommended Priority Action Items:', 14, currentY);
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      aiReport.actionItems.forEach((item: string, idx: number) => {
        const itemText = doc.splitTextToSize(`• ${item}`, 180);
        doc.text(itemText, 16, currentY);
        currentY += itemText.length * 3.8;
      });
    }
  }

  // Add Page Numbers and Footer to all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Intelligent Khata • Verified Accounting Ledger • ${business.name}`,
      14,
      290
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      196,
      290,
      { align: 'right' }
    );
  }

  const filename = `${business.name.replace(/\s+/g, '_')}_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
