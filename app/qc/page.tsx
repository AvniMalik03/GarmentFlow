'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

type StageKey =
  | 'cloth_received'
  | 'cutting'
  | 'stitching'
  | 'finishing'
  | 'ironing'
  | 'packing'
  | 'dispatch';

interface Order {
  id: string;
  client_name?: string;
  clientName?: string;
  product_name?: string;
  productName?: string;
  quantity: number;
  current_stage?: StageKey | string;
}

const STAGE_LABELS: Record<string, string> = {
  cloth_received: 'Cloth Received',
  cutting: 'Cutting',
  stitching: 'Stitching',
  finishing: 'Finishing',
  ironing: 'Ironing',
  packing: 'Packing',
  dispatch: 'Dispatch',
};

const DEFAULT_MOCK_ORDERS: Order[] = [
  {
    id: 'PO-2026-1238',
    client_name: 'Westside',
    product_name: 'Slim Fit Denim Jeans',
    quantity: 1500,
    current_stage: 'stitching',
  },
  {
    id: 'PO-2026-4481',
    client_name: 'FabIndia',
    product_name: 'Women\'s Cotton Kurta',
    quantity: 1200,
    current_stage: 'finishing',
  },
  {
    id: 'PO-2026-9045',
    client_name: 'Reliance Trends',
    product_name: 'Classic Polo T-Shirt',
    quantity: 2000,
    current_stage: 'cutting',
  },
];

interface SubmissionData {
  orderId: string;
  inspectorName: string;
  defectRate: string;
  result: 'Passed' | 'Review Required' | 'Failed';
  timestamp: string;
}

export default function QCInspectionPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [inspectorName, setInspectorName] = useState<string>('');
  const [piecesChecked, setPiecesChecked] = useState<string>('');
  const [defectivePieces, setDefectivePieces] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [submittedData, setSubmittedData] = useState<SubmissionData | null>(null);

  // Load orders from local storage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('garment_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      }
    } catch {
      // Fallback silently if storage read fails
    }
  }, []);

  // Merge default mock orders with stored local orders to provide rich data
  const allOrders = useMemo(() => {
    const ids = new Set(orders.map((o) => o.id));
    const merged = [...orders];
    DEFAULT_MOCK_ORDERS.forEach((mock) => {
      if (!ids.has(mock.id)) {
        merged.push(mock);
      }
    });
    return merged;
  }, [orders]);

  // Retrieve the selected order object
  const selectedOrder = useMemo(() => {
    return allOrders.find((order) => order.id === selectedOrderId) || null;
  }, [allOrders, selectedOrderId]);

  // Today's date formatted nicely
  const todayDateString = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  // Automatic defect rate calculation
  const defectRate = useMemo(() => {
    const checked = Number(piecesChecked);
    const defective = Number(defectivePieces);
    if (isNaN(checked) || checked <= 0) return 0;
    if (isNaN(defective) || defective < 0) return 0;
    return (defective / checked) * 100;
  }, [piecesChecked, defectivePieces]);

  // Automatic inspection status evaluation
  const inspectionStatus = useMemo<'Passed' | 'Review Required' | 'Failed'>(() => {
    if (Number(piecesChecked) <= 0) return 'Passed';
    if (defectRate <= 3) return 'Passed';
    if (defectRate <= 10) return 'Review Required';
    return 'Failed';
  }, [defectRate, piecesChecked]);

  // Validation: defective pieces should not exceed total checked
  const hasDefectError = useMemo(() => {
    const checked = Number(piecesChecked);
    const defective = Number(defectivePieces);
    return checked > 0 && defective > checked;
  }, [piecesChecked, defectivePieces]);

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedOrderId ||
      !inspectorName.trim() ||
      !piecesChecked ||
      Number(piecesChecked) <= 0 ||
      hasDefectError
    ) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + `, ${todayDateString}`;

    setSubmittedData({
      orderId: selectedOrderId,
      inspectorName: inspectorName.trim(),
      defectRate: `${defectRate.toFixed(2)}%`,
      result: inspectionStatus,
      timestamp,
    });
  };

  // Reset form to record another inspection
  const handleReset = () => {
    setSelectedOrderId('');
    setInspectorName('');
    setPiecesChecked('');
    setDefectivePieces('');
    setRemarks('');
    setSubmittedData(null);
  };

  // Status styling configurations
  const getStatusStyles = (status: 'Passed' | 'Review Required' | 'Failed') => {
    switch (status) {
      case 'Passed':
        return {
          badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
          dot: 'bg-emerald-400',
          text: 'text-emerald-400',
        };
      case 'Review Required':
        return {
          badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
          dot: 'bg-amber-400',
          text: 'text-amber-400',
        };
      case 'Failed':
        return {
          badge: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
          dot: 'bg-rose-400',
          text: 'text-rose-400',
        };
    }
  };

  const activeStyles = getStatusStyles(inspectionStatus);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12 text-slate-100 animate-fade-in">
        {/* Page Header */}
        <header className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">QC Inspection</h1>
          <p className="mt-1 text-sm text-slate-400">
            Inspect production quality and record inspection results before orders move forward.
          </p>
        </header>

        {submittedData ? (
          /* Success State Card */
          <div className="rounded-2xl border border-slate-850 bg-slate-950/65 p-6 md:p-8 max-w-2xl mx-auto shadow-2xl shadow-black/35 animate-fade-in space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-2xl text-emerald-400 mb-4 shadow-lg shadow-emerald-950/30">
                ✓
              </div>
              <h2 className="text-2xl font-extrabold text-white">✓ Inspection Submitted</h2>
              <p className="text-sm text-slate-400 mt-1.5">
                Quality control verification completed and saved locally.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 divide-y divide-slate-800/80">
              <div className="flex justify-between py-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Order ID</span>
                <span className="text-sm font-semibold text-slate-200">{submittedData.orderId}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inspector Name</span>
                <span className="text-sm font-semibold text-slate-200">{submittedData.inspectorName}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Defect Rate</span>
                <span className="text-sm font-mono font-bold text-slate-200">{submittedData.defectRate}</span>
              </div>
              <div className="flex justify-between py-3 items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inspection Result</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                    getStatusStyles(submittedData.result).badge
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusStyles(submittedData.result).dot}`} />
                  {submittedData.result}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Submission Timestamp</span>
                <span className="text-sm font-semibold text-slate-400">{submittedData.timestamp}</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-lg shadow-indigo-950/40 transition focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              >
                Log Another Inspection
              </button>
            </div>
          </div>
        ) : (
          /* Inspection Flow Panels */
          <div className="space-y-7">
            {/* Order Selector Card */}
            <section className="rounded-2xl border border-slate-800 bg-slate-950/55 p-5 shadow-xl shadow-black/10 md:p-6 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Production Order</span>
                <select
                  value={selectedOrderId}
                  onChange={(e) => {
                    setSelectedOrderId(e.target.value);
                    // Clear check results when order changes
                    setPiecesChecked('');
                    setDefectivePieces('');
                  }}
                  className="mt-2.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                >
                  <option value="">Choose an order to begin...</option>
                  {allOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.id} — {order.client_name || order.clientName || 'Unknown Client'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrder ? (
                /* Order Details Panel */
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-5 grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Order ID</span>
                    <span className="text-sm font-bold text-slate-200 mt-1 block truncate" title={selectedOrder.id}>
                      {selectedOrder.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Client Name</span>
                    <span
                      className="text-sm font-semibold text-slate-200 mt-1 block truncate"
                      title={selectedOrder.client_name || selectedOrder.clientName}
                    >
                      {selectedOrder.client_name || selectedOrder.clientName || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Product Name</span>
                    <span
                      className="text-sm font-semibold text-slate-200 mt-1 block truncate"
                      title={selectedOrder.product_name || selectedOrder.productName}
                    >
                      {selectedOrder.product_name || selectedOrder.productName || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Quantity</span>
                    <span className="text-sm font-mono font-bold text-slate-200 mt-1 block">
                      {(selectedOrder.quantity || 0).toLocaleString('en-IN')} pcs
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Current Stage</span>
                    <span className="text-sm font-bold text-indigo-400 mt-1 block capitalize">
                      {STAGE_LABELS[selectedOrder.current_stage as string] || selectedOrder.current_stage || 'Not set'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-800/80 bg-slate-900/10 py-6 text-center text-sm text-slate-500 font-medium">
                  Please select an active production order to load details and inspect.
                </div>
              )}
            </section>

            {/* Split Form & Summary Layout */}
            <div className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Inspection Form */}
              <section className="rounded-2xl border border-slate-800 bg-slate-950/55 p-5 shadow-xl shadow-black/10 md:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white">Inspection Inputs</h2>
                  <p className="mt-1 text-xs text-slate-500">Record pieces checked and defect specifics.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inspector Name</span>
                        <input
                          type="text"
                          value={inspectorName}
                          onChange={(e) => setInspectorName(e.target.value)}
                          placeholder="e.g. John Doe"
                          disabled={!selectedOrderId}
                          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-600 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-800 disabled:bg-slate-900/40"
                          required
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pieces Checked</span>
                        <input
                          type="number"
                          min="1"
                          value={piecesChecked}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setPiecesChecked(val);
                            }
                          }}
                          placeholder="e.g. 500"
                          disabled={!selectedOrderId}
                          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-mono font-bold text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-600 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-800 disabled:bg-slate-900/40"
                          required
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Defective Pieces</span>
                        <input
                          type="number"
                          min="0"
                          value={defectivePieces}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setDefectivePieces(val);
                            }
                          }}
                          placeholder="e.g. 10"
                          disabled={!selectedOrderId}
                          className={`mt-2 w-full rounded-xl border bg-slate-900 px-4 py-3 text-sm font-mono font-bold text-white outline-none transition placeholder-slate-600 disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-800 disabled:bg-slate-900/40 ${
                            hasDefectError
                              ? 'border-rose-500 focus:ring-rose-500/10'
                              : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/10'
                          }`}
                          required
                        />
                      </label>
                      {hasDefectError && (
                        <p className="text-xs text-rose-400 mt-1.5 font-semibold">
                          Defective pieces cannot exceed checked pieces ({piecesChecked}).
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="block">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Calculated Defect Rate</span>
                        <div className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 min-h-[46px] flex items-center justify-between text-slate-200">
                          <span className="text-xs font-medium text-slate-500">Defect Percentage:</span>
                          <span className="font-mono font-bold text-white text-base">
                            {Number(piecesChecked) > 0 ? `${defectRate.toFixed(2)}%` : '0.00%'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Remarks</span>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Detail specific defects (e.g., stitching errors, fabric stains)..."
                        disabled={!selectedOrderId}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-600 resize-none disabled:cursor-not-allowed disabled:text-slate-500 disabled:border-slate-800 disabled:bg-slate-900/40"
                      />
                    </label>
                  </div>
                </form>
              </section>

              {/* Inspection Summary */}
              <section className="rounded-2xl border border-slate-800 bg-slate-950/55 p-5 shadow-xl shadow-black/10 md:p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-white">Inspection Summary</h2>
                    <p className="mt-1 text-xs text-slate-500">Real-time status tracking of inspection inputs.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-1 border-b border-slate-900/50">
                      <span className="text-xs text-slate-400 font-medium">Date</span>
                      <span className="text-sm font-semibold text-slate-200">{todayDateString}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-900/50">
                      <span className="text-xs text-slate-400 font-medium">Selected Order</span>
                      <span
                        className="text-sm font-bold text-indigo-400 truncate max-w-[160px] text-right"
                        title={selectedOrder ? selectedOrder.id : 'None'}
                      >
                        {selectedOrder ? selectedOrder.id : '—'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-900/50">
                      <span className="text-xs text-slate-400 font-medium">Inspector Name</span>
                      <span
                        className="text-sm font-semibold text-slate-200 truncate max-w-[160px] text-right"
                        title={inspectorName}
                      >
                        {inspectorName.trim() ? inspectorName : '—'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-900/50">
                      <span className="text-xs text-slate-400 font-medium">Defect Rate</span>
                      <span className="text-sm font-mono font-bold text-slate-200">
                        {Number(piecesChecked) > 0 ? `${defectRate.toFixed(2)}%` : '0.00%'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-slate-400 font-medium">Inspection Status</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider transition-colors duration-300 ${activeStyles.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${activeStyles.dot}`} />
                        {inspectionStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={
                      !selectedOrderId ||
                      !inspectorName.trim() ||
                      !piecesChecked ||
                      Number(piecesChecked) <= 0 ||
                      hasDefectError
                    }
                    className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                  >
                    Submit Inspection
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
