import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  Fuel,
  TrendingUp,
  Truck,
  Droplet,
  Plus,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Gauge,
  Calendar,
  DollarSign,
  Edit3,
} from 'lucide-react';
import { formatPKR } from '../../lib/formatters';

export const PetrolPumpDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const {
    activeBusiness,
    customers,
    sales,
    updateFuelRates,
    recordSale,
    setIsVoiceAssistantOpen,
  } = useKhata();

  const fuelRates = activeBusiness.fuelRates || {
    petrol: 275.6,
    diesel: 284.4,
    hiOctane: 298.0,
    lastUpdated: new Date().toISOString(),
  };

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isFleetSaleOpen, setIsFleetSaleOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  // Rates Update Form
  const [petrolRateInput, setPetrolRateInput] = useState(fuelRates.petrol.toString());
  const [dieselRateInput, setDieselRateInput] = useState(fuelRates.diesel.toString());
  const [hiOctaneRateInput, setHiOctaneRateInput] = useState(fuelRates.hiOctane.toString());

  // Shift Close Form
  const [shiftNozzle, setShiftNozzle] = useState('Nozzle #1 (Super Petrol)');
  const [startMeter, setStartMeter] = useState('142500');
  const [endMeter, setEndMeter] = useState('146800');
  const [shiftFuelType, setShiftFuelType] = useState<'petrol' | 'diesel' | 'hiOctane'>('petrol');

  // Fleet Credit Sale Form
  const [fleetCustName, setFleetCustName] = useState('Niazi Goods Forwarding');
  const [fleetVehicleNo, setFleetVehicleNo] = useState('TKP-8890');
  const [fleetFuelType, setFleetFuelType] = useState<'petrol' | 'diesel'>('diesel');
  const [fleetLitres, setFleetLitres] = useState('150');

  const totalReceivable = customers.reduce((sum, c) => sum + c.totalReceivable, 0);
  const todaySales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const handleUpdateRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateFuelRates({
      petrol: parseFloat(petrolRateInput) || fuelRates.petrol,
      diesel: parseFloat(dieselRateInput) || fuelRates.diesel,
      hiOctane: parseFloat(hiOctaneRateInput) || fuelRates.hiOctane,
    });
    setIsRateModalOpen(false);
  };

  const handleShiftClose = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseFloat(startMeter) || 0;
    const end = parseFloat(endMeter) || 0;
    const litresSold = Math.max(0, end - start);
    const rate = fuelRates[shiftFuelType];
    const totalRevenue = Math.round(litresSold * rate);

    recordSale({
      date: new Date().toISOString(),
      customerName: 'Shift Cash & Card Sales',
      items: [
        {
          productId: `prod_fuel_${shiftFuelType}`,
          productName: `${shiftNozzle} (${shiftFuelType.toUpperCase()})`,
          quantity: litresSold,
          unitPrice: rate,
          unit: 'Litre',
          total: totalRevenue,
        },
      ],
      subtotal: totalRevenue,
      discount: 0,
      tax: 0,
      totalAmount: totalRevenue,
      receivedAmount: totalRevenue,
      udhaarAmount: 0,
      paymentMethod: 'Cash',
      notes: `Shift Meter Closing: Start ${start} -> End ${end} (${litresSold} Litres dispensed)`,
      type: 'fuel_log',
    });

    setIsShiftModalOpen(false);
  };

  const handleFleetCreditSale = (e: React.FormEvent) => {
    e.preventDefault();
    const litres = parseFloat(fleetLitres) || 100;
    const rate = fuelRates[fleetFuelType];
    const totalAmount = Math.round(litres * rate);

    recordSale({
      date: new Date().toISOString(),
      customerName: fleetCustName,
      items: [
        {
          productId: `prod_fuel_${fleetFuelType}`,
          productName: `${fleetFuelType.toUpperCase()} Refuel [Vehicle #${fleetVehicleNo}]`,
          quantity: litres,
          unitPrice: rate,
          unit: 'Litre',
          total: totalAmount,
        },
      ],
      subtotal: totalAmount,
      discount: 0,
      tax: 0,
      totalAmount,
      receivedAmount: 0,
      udhaarAmount: totalAmount,
      paymentMethod: 'Fleet Udhaar' as any,
      notes: `Fleet Credit: Vehicle #${fleetVehicleNo}, ${litres}L @ Rs. ${rate}/L`,
      type: 'fuel_log',
    });

    setIsFleetSaleOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Fuel Price Ticker */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Fuel className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official OGRA Fuel Price Board
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Station Pump Operations</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Super Petrol</span>
              <p className="text-base sm:text-lg font-bold text-amber-400 mt-0.5">Rs. {fuelRates.petrol}</p>
              <span className="text-[10px] text-slate-400">/ Litre</span>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Euro-V Diesel</span>
              <p className="text-base sm:text-lg font-bold text-[#10B981] mt-0.5">Rs. {fuelRates.diesel}</p>
              <span className="text-[10px] text-slate-400">/ Litre</span>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Hi-Octane</span>
              <p className="text-base sm:text-lg font-bold text-cyan-400 mt-0.5">Rs. {fuelRates.hiOctane}</p>
              <span className="text-[10px] text-slate-400">/ Litre</span>
            </div>
          </div>

          <button
            onClick={() => setIsRateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update OGRA Rates</span>
          </button>
        </div>
      </div>

      {/* 2. Key Fuel Station Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Litres Dispensed</span>
              <Droplet className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">8,950 L</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-3/4 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Petrol: 5,100L &bull; Diesel: 3,850L</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Today&apos;s Revenue</span>
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#10B981] mt-1">{formatPKR(todaySales, { compact: true })}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-full rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{sales.length} Dispenser Shifts Logged</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Fleet Udhaar</span>
              <Truck className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">{formatPKR(totalReceivable)}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-1/2 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{customers.length} Fleet Credit Accounts</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Active Nozzles</span>
              <Gauge className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">6 Nozzles</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400 w-4/5 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">2 Underground Storage Tanks</p>
          </div>
        </div>
      </div>

      {/* 3. Shift Management & Fleet Credit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-[#0F172A] text-base">Underground Storage Tanks & Dips</h3>
              <p className="text-xs text-slate-500">Live calibration for remaining fuel stock</p>
            </div>
            <button
              onClick={() => setIsShiftModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Dispenser Shift Closing</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tank 1: Super Petrol */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-amber-500" />
                  Tank 1: Super Petrol
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">72% Full</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 mb-3 overflow-hidden">
                <div className="bg-amber-500 h-3 rounded-full" style={{ width: '72%' }} />
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Dip Level: <strong>185 cm</strong></span>
                <span>Remaining: <strong>21,600 L</strong></span>
              </div>
            </div>

            {/* Tank 2: Euro-V Diesel */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-emerald-600" />
                  Tank 2: Euro-V Diesel
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">58% Full</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 mb-3 overflow-hidden">
                <div className="bg-emerald-600 h-3 rounded-full" style={{ width: '58%' }} />
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Dip Level: <strong>154 cm</strong></span>
                <span>Remaining: <strong>17,400 L</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Fleet Refuel Button */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-[#0F172A] text-base mb-1">Fleet Credit Khata</h3>
            <p className="text-xs text-slate-500">Record vehicle refuel slips for transport companies</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setIsFleetSaleOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Issue Fleet Fuel Voucher</span>
              </div>
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Voice Shift Entry</span>
              </div>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-[#0F172A] block mb-0.5">Automated OGRA Ledger</span>
            Every shift automatically reconciles with pump meter counters and tank dip physical stock.
          </div>
        </div>
      </div>

      {/* Modal: Update OGRA Rates */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">Update Fuel Rates (OGRA)</h3>
            <p className="text-xs text-slate-500 mb-4">Set per-litre pricing for your station.</p>
            <form onSubmit={handleUpdateRates} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Super Petrol (Rs / Litre)</label>
                <input
                  type="number"
                  step="0.1"
                  value={petrolRateInput}
                  onChange={(e) => setPetrolRateInput(e.target.value)}
                  className="w-full font-bold px-4 py-2.5 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Euro-V Diesel (Rs / Litre)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dieselRateInput}
                  onChange={(e) => setDieselRateInput(e.target.value)}
                  className="w-full font-bold px-4 py-2.5 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hi-Octane (Rs / Litre)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hiOctaneRateInput}
                  onChange={(e) => setHiOctaneRateInput(e.target.value)}
                  className="w-full font-bold px-4 py-2.5 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  Save OGRA Rates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Shift Close */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">Log Dispenser Shift Closing</h3>
            <p className="text-xs text-slate-500 mb-4">Enter start & end meter readings on nozzle.</p>
            <form onSubmit={handleShiftClose} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nozzle & Fuel</label>
                <select
                  value={shiftNozzle}
                  onChange={(e) => {
                    setShiftNozzle(e.target.value);
                    if (e.target.value.includes('Diesel')) setShiftFuelType('diesel');
                    else if (e.target.value.includes('Hi-Octane')) setShiftFuelType('hiOctane');
                    else setShiftFuelType('petrol');
                  }}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                >
                  <option value="Nozzle #1 (Super Petrol)">Nozzle #1 (Super Petrol)</option>
                  <option value="Nozzle #2 (Super Petrol)">Nozzle #2 (Super Petrol)</option>
                  <option value="Nozzle #3 (Euro-V Diesel)">Nozzle #3 (Euro-V Diesel)</option>
                  <option value="Nozzle #4 (Euro-V Diesel)">Nozzle #4 (Euro-V Diesel)</option>
                  <option value="Nozzle #5 (Hi-Octane 97)">Nozzle #5 (Hi-Octane 97)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Opening Meter</label>
                  <input
                    type="number"
                    value={startMeter}
                    onChange={(e) => setStartMeter(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Closing Meter</label>
                  <input
                    type="number"
                    value={endMeter}
                    onChange={(e) => setEndMeter(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs font-bold">
                <span>Litres Dispensed:</span>
                <span className="text-[#10B981]">
                  {Math.max(0, (parseFloat(endMeter) || 0) - (parseFloat(startMeter) || 0)).toLocaleString()} Litres
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  Save Shift Summary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fleet Voucher */}
      {isFleetSaleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">Issue Fleet Credit Fuel Slip</h3>
            <p className="text-xs text-slate-500 mb-4">Record credit refuel for transport company.</p>
            <form onSubmit={handleFleetCreditSale} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Transport Fleet / Company</label>
                <input
                  type="text"
                  value={fleetCustName}
                  onChange={(e) => setFleetCustName(e.target.value)}
                  placeholder="e.g. Niazi Goods Forwarding"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle / Truck Number</label>
                  <input
                    type="text"
                    value={fleetVehicleNo}
                    onChange={(e) => setFleetVehicleNo(e.target.value)}
                    placeholder="e.g. TKP-8890"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fuel Type</label>
                  <select
                    value={fleetFuelType}
                    onChange={(e) => setFleetFuelType(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                  >
                    <option value="diesel">Euro-V Diesel</option>
                    <option value="petrol">Super Petrol</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quantity (Litres)</label>
                <input
                  type="number"
                  value={fleetLitres}
                  onChange={(e) => setFleetLitres(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFleetSaleOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  Issue Fleet Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
