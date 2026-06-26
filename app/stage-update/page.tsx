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

type StoredOrder = Record<string, unknown> & {
  id: string;
  current_stage?: unknown;
  completedQuantity?: number;
  remainingQuantity?: number;
};

type Activity = {
  id: number;
  orderId: string;
  from: StageKey;
  to: StageKey;
  timestamp: Date;
};

const STORAGE_KEY = 'garment_orders';

const STAGES: { key: StageKey; label: string; progress: number }[] = [
  { key: 'cloth_received', label: 'Cloth Received', progress: 15 },
  { key: 'cutting', label: 'Cutting', progress: 30 },
  { key: 'stitching', label: 'Stitching', progress: 55 },
  { key: 'finishing', label: 'Finishing', progress: 70 },
  { key: 'ironing', label: 'Ironing', progress: 85 },
  { key: 'packing', label: 'Packing', progress: 92 },
  { key: 'dispatch', label: 'Dispatch', progress: 100 },
];

const isStageKey = (value: unknown): value is StageKey =>
  STAGES.some((stage) => stage.key === value);

const getText = (order: StoredOrder, snakeCase: string, camelCase: string) => {
  const value = order[snakeCase] ?? order[camelCase];
  return typeof value === 'string' && value.trim() ? value : 'Not specified';
};

const formatDeadline = (value: unknown) => {
  if (typeof value !== 'string' || !value) return 'Not scheduled';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const priorityClasses: Record<string, string> = {
  low: 'border-slate-700 bg-slate-800 text-slate-300',
  medium: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  high: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  urgent: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
};

export default function StageUpdatePage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [storageError, setStorageError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [piecesCompletedToday, setPiecesCompletedToday] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const validOrders = parsed
          .filter(
            (value): value is StoredOrder =>
              typeof value === 'object' &&
              value !== null &&
              typeof (value as Record<string, unknown>).id === 'string'
          )
          .map((order) =>
            order.current_stage === 'dispatch' && order.status !== 'completed'
              ? { ...order, status: 'completed' }
              : order
          );

        setOrders(validOrders);

        if (validOrders.some((order, index) => order !== parsed[index])) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validOrders));
        }
      }
    } catch {
      setStorageError('Orders could not be read from local storage.');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const orderQuantity = useMemo(() => {
    if (!selectedOrder) return 0;
    return Number(selectedOrder.quantity) || 0;
  }, [selectedOrder]);

  const completedPieces = useMemo(() => {
    if (!selectedOrder) return 0;
    return typeof selectedOrder.completedQuantity === 'number'
      ? selectedOrder.completedQuantity
      : 0;
  }, [selectedOrder]);

  const remainingPieces = useMemo(() => {
    if (!selectedOrder) return 0;
    return typeof selectedOrder.remainingQuantity === 'number'
      ? selectedOrder.remainingQuantity
      : Math.max(0, orderQuantity - completedPieces);
  }, [selectedOrder, orderQuantity, completedPieces]);

  const progressPercentage = useMemo(() => {
    if (orderQuantity <= 0) return 0;
    const pct = (completedPieces / orderQuantity) * 100;
    return Math.round(pct * 10) / 10;
  }, [completedPieces, orderQuantity]);

  const inputValidationMessage = useMemo(() => {
    if (!piecesCompletedToday) return '';
    const count = parseInt(piecesCompletedToday, 10);
    if (Number.isNaN(count)) return 'Please enter a valid number';
    if (count <= 0) return 'Quantity must be greater than 0';
    if (count > remainingPieces) {
      return `Quantity cannot exceed remaining pieces (${remainingPieces})`;
    }
    return '';
  }, [piecesCompletedToday, remainingPieces]);

  const isUpdateDisabled = useMemo(() => {
    if (completedPieces >= orderQuantity) return true;
    if (!piecesCompletedToday) return true;
    const count = parseInt(piecesCompletedToday, 10);
    return Number.isNaN(count) || count <= 0 || count > remainingPieces;
  }, [completedPieces, orderQuantity, piecesCompletedToday, remainingPieces]);

  const handleUpdateProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const count = parseInt(piecesCompletedToday, 10);
    if (Number.isNaN(count) || count <= 0 || count > remainingPieces) return;

    const newCompleted = Math.min(orderQuantity, completedPieces + count);
    const newRemaining = Math.max(0, orderQuantity - newCompleted);

    const nextOrders = orders.map((order) =>
      order.id === selectedOrder.id
        ? {
            ...order,
            completedQuantity: newCompleted,
            remainingQuantity: newRemaining,
          }
        : order
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOrders));
      setOrders(nextOrders);
      setStorageError('');
      setPiecesCompletedToday('');
    } catch {
      setStorageError('The production quantity could not be saved. Please check browser storage and try again.');
    }
  };

  const currentStage = selectedOrder && isStageKey(selectedOrder.current_stage)
    ? selectedOrder.current_stage
    : 'cloth_received';
  const currentStageIndex = STAGES.findIndex((stage) => stage.key === currentStage);
  const currentStageInfo = STAGES[currentStageIndex];
  const nextStage = STAGES[currentStageIndex + 1] ?? null;
  const isComplete = currentStage === 'dispatch';
  const selectedActivities = activities.filter(
    (activity) => activity.orderId === selectedOrderId
  );

  const moveToNextStage = () => {
    if (!selectedOrder || !nextStage) return;

    const nextOrders = orders.map((order) =>
      order.id === selectedOrder.id
        ? {
            ...order,
            current_stage: nextStage.key,
            ...(nextStage.key === 'dispatch' ? { status: 'completed' } : {}),
          }
        : order
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOrders));
      setOrders(nextOrders);
      setStorageError('');
      setActivities((current) => [
        {
          id: Date.now(),
          orderId: selectedOrder.id,
          from: currentStage,
          to: nextStage.key,
          timestamp: new Date(),
        },
        ...current,
      ]);
    } catch {
      setStorageError('The stage could not be saved. Please check browser storage and try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-7 pb-12 text-slate-100 animate-fade-in">
        <header className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Stage Update</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage production progress across manufacturing stages.
          </p>
        </header>

        {storageError && (
          <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {storageError}
          </div>
        )}

        <section className="rounded-2xl border border-slate-800 bg-slate-950/55 p-5 shadow-xl shadow-black/10 md:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(260px,1.2fr)_repeat(4,minmax(120px,1fr))] lg:items-end">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Order</span>
              <select
                value={selectedOrderId}
                onChange={(event) => setSelectedOrderId(event.target.value)}
                disabled={!orders.length}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:text-slate-500"
              >
                <option value="">
                  {!isLoaded ? 'Loading orders...' : orders.length ? 'Select an order' : 'No saved orders available'}
                </option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.id} — {getText(order, 'client_name', 'clientName')}
                  </option>
                ))}
              </select>
            </label>

            <OrderDetail label="Client Name" value={selectedOrder ? getText(selectedOrder, 'client_name', 'clientName') : '—'} />
            <OrderDetail label="Product Name" value={selectedOrder ? getText(selectedOrder, 'product_name', 'productName') : '—'} />
            <OrderDetail label="Quantity" value={selectedOrder && (typeof selectedOrder.quantity === 'number' || typeof selectedOrder.quantity === 'string') ? Number(selectedOrder.quantity).toLocaleString('en-IN') : '—'} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Priority / Deadline</p>
              {selectedOrder ? (
                <div className="mt-2 flex min-h-[46px] flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${priorityClasses[String(selectedOrder.priority).toLowerCase()] ?? priorityClasses.low}`}>
                    {typeof selectedOrder.priority === 'string' ? selectedOrder.priority : 'Not set'}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">{formatDeadline(selectedOrder.deadline)}</span>
                </div>
              ) : (
                <p className="mt-2 min-h-[46px] py-3 text-sm font-semibold text-slate-600">—</p>
              )}
            </div>
          </div>

          {!selectedOrder && (
            <div className="mt-5 rounded-xl border border-dashed border-slate-800 bg-slate-900/35 px-4 py-6 text-center text-sm text-slate-400">
              Select an order to begin stage management.
            </div>
          )}
        </section>

        {selectedOrder && (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-950/55 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">Current Stage</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-white">{currentStageInfo.label}</h2>
                </div>
                <div className="sm:text-right">
                  <p className="text-3xl font-black text-indigo-400">{currentStageInfo.progress}%</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Complete</p>
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full border border-slate-800 bg-slate-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-400 transition-all duration-700 ease-out"
                  style={{ width: `${currentStageInfo.progress}%` }}
                  role="progressbar"
                  aria-label="Production progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={currentStageInfo.progress}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/55 p-5 md:p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white">Production Pipeline</h2>
                <p className="mt-1 text-xs text-slate-500">Live manufacturing position for order {selectedOrder.id}</p>
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="flex min-w-[940px] items-stretch">
                  {STAGES.map((stage, index) => {
                    const completed = index < currentStageIndex || (isComplete && index === currentStageIndex);
                    const active = !isComplete && index === currentStageIndex;
                    return (
                      <React.Fragment key={stage.key}>
                        <div className={`flex min-h-28 w-32 shrink-0 flex-col justify-between rounded-xl border p-3 transition ${completed ? 'border-emerald-500/35 bg-emerald-500/10' : active ? 'border-indigo-400 bg-indigo-500/15 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/25' : 'border-slate-800 bg-slate-900/60'}`}>
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black ${completed ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : active ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-700 text-slate-600'}`}>
                            {completed ? '✓' : index + 1}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${completed ? 'text-emerald-300' : active ? 'text-indigo-300' : 'text-slate-500'}`}>{stage.label}</p>
                            <p className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${completed ? 'text-emerald-500' : active ? 'text-indigo-400' : 'text-slate-700'}`}>
                              {completed ? 'Completed' : active ? 'Current' : 'Upcoming'}
                            </p>
                          </div>
                        </div>
                        {index < STAGES.length - 1 && (
                          <div className={`flex w-8 shrink-0 items-center justify-center text-xl ${index < currentStageIndex ? 'text-emerald-500' : 'text-slate-700'}`} aria-hidden="true">→</div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Production Quantity Tracking Section */}
            <section className="rounded-2xl border border-slate-800 bg-slate-950/55 p-5 md:p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Production Quantity</h2>
                  <p className="mt-1 text-xs text-slate-500">Track and record manufacturing counts for this order.</p>
                </div>
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-400">
                  Daily Tracking
                </span>
              </div>

              {/* Order Summary & Metrics Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Order Summary */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4 md:col-span-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Summary</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-600">Client Name</p>
                      <p className="text-sm font-semibold text-slate-200">
                        {getText(selectedOrder, 'client_name', 'clientName')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-600">Product Name</p>
                      <p className="text-sm font-semibold text-slate-200">
                        {getText(selectedOrder, 'product_name', 'productName')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-600">Order Quantity</p>
                      <p className="text-sm font-semibold text-slate-200">
                        {orderQuantity.toLocaleString('en-IN')} Pieces
                      </p>
                    </div>
                  </div>
                </div>

                {/* Production Progress Metrics */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Order Quantity Card */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Quantity</span>
                      <div className="mt-2">
                        <span className="text-lg sm:text-2xl font-black text-indigo-400 font-mono">
                          {orderQuantity.toLocaleString('en-IN')}
                        </span>
                        <span className="ml-1 text-[10px] font-semibold text-slate-400">Pieces</span>
                      </div>
                    </div>

                    {/* Completed Pieces Card */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completed</span>
                      <div className="mt-2">
                        <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">
                          {completedPieces.toLocaleString('en-IN')}
                        </span>
                        <span className="ml-1 text-[10px] font-semibold text-slate-400">Pieces</span>
                      </div>
                    </div>

                    {/* Remaining Pieces Card */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Remaining</span>
                      <div className="mt-2">
                        <span className="text-lg sm:text-2xl font-black text-amber-400 font-mono">
                          {remainingPieces.toLocaleString('en-IN')}
                        </span>
                        <span className="ml-1 text-[10px] font-semibold text-slate-400">Pieces</span>
                      </div>
                    </div>
                  </div>

                  {/* Modern Animated Progress Bar */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completed Progress</span>
                      </div>
                      <span className="font-mono font-bold text-slate-300 text-xs">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 transition-all duration-700 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                        role="progressbar"
                        aria-label="Production completion progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progressPercentage}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Production Actions */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                {completedPieces === orderQuantity ? (
                  /* Completion State */
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-lg">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white">Production Completed</h4>
                        <p className="text-xs text-slate-400">All Pieces Manufactured Successfully</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-900 px-6 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                    >
                      Completed
                    </button>
                  </div>
                ) : (
                  /* Today's Production Form */
                  <form onSubmit={handleUpdateProduction} className="flex flex-col sm:flex-row items-end gap-4 justify-between">
                    <div className="w-full sm:max-w-xs space-y-2">
                      <label htmlFor="piecesCompletedToday" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Pieces Completed Today
                      </label>
                      <input
                        id="piecesCompletedToday"
                        type="text"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        placeholder="e.g. 150"
                        value={piecesCompletedToday}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^[0-9]+$/.test(val)) {
                            setPiecesCompletedToday(val);
                          }
                        }}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                      {inputValidationMessage && (
                        <p className="text-xs font-semibold text-rose-400">{inputValidationMessage}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdateDisabled}
                      className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:border-slate-800"
                    >
                      Update Production
                    </button>
                  </form>
                )}
              </div>
            </section>

            <div className="grid gap-7 lg:grid-cols-[1fr_1.15fr]">
              <section className={`rounded-2xl border p-6 ${isComplete ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-800 bg-slate-950/55'}`}>
                {isComplete ? (
                  <div className="mb-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15 text-xl text-emerald-300">✓</div>
                    <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
                      Production Completed
                    </span>
                    <div className="mt-4 space-y-2">
                      <h2 className="text-xl font-extrabold text-white">✓ Order Successfully Dispatched</h2>
                      <p className="font-semibold text-emerald-300">✓ Production Workflow Finished</p>
                    </div>
                  </div>
                ) : (
                  <h2 className="mb-6 text-lg font-bold text-white">Stage Action</h2>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <StageSummary label="Current Stage" value={currentStageInfo.label} />
                  <StageSummary label="Next Stage" value={nextStage?.label ?? '—'} />
                </div>
                <button
                  type="button"
                  onClick={moveToNextStage}
                  disabled={isComplete}
                  className="mt-5 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-emerald-600/30 disabled:text-emerald-300 disabled:shadow-none"
                >
                  {isComplete ? 'Completed' : 'Move To Next Stage'}
                </button>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-950/55 p-6">
                <h2 className="text-lg font-bold text-white">Recent Stage Activity</h2>
                <p className="mt-1 text-xs text-slate-500">Updates made during this session</p>
                {selectedActivities.length ? (
                  <ol className="mt-5 space-y-3">
                    {selectedActivities.map((activity) => (
                      <li key={activity.id} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/55 p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm text-emerald-400">✓</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-200">
                            {STAGES.find((stage) => stage.key === activity.from)?.label} <span className="px-1 text-slate-600">→</span> {STAGES.find((stage) => stage.key === activity.to)?.label}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">{activity.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
                    No stage updates in this session yet.
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function OrderDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 min-h-[46px] truncate py-3 text-sm font-semibold text-slate-200" title={value}>{value}</p>
    </div>
  );
}

function StageSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}
