'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Stage, Priority, OrderStatus } from '@/types';

// Define the full list of production pipeline stages in sequence
const PIPELINE_STAGES: { key: Stage; label: string; desc: string }[] = [
  { key: 'cloth_received', label: 'Cloth Received', desc: 'Fabric raw material received & checked' },
  { key: 'cutting', label: 'Cutting', desc: 'Fabric cut according to size templates' },
  { key: 'stitching', label: 'Stitching', desc: 'Garment pieces stitched together' },
  { key: 'finishing', label: 'Finishing', desc: 'Quality checking, thread trimming & details' },
  { key: 'ironing', label: 'Ironing', desc: 'Steam pressing and crease removal' },
  { key: 'packing', label: 'Packing', desc: 'Barcoded tag attachment & final poly-packing' },
  { key: 'dispatch', label: 'Dispatch', desc: 'Dispatched to logistics & client delivery' },
];

// Custom stage progress percentages mapping (represents realistic effort weight)
const STAGE_PROGRESS: Record<Stage, number> = {
  cloth_received: 15,
  cutting: 30,
  stitching: 55,
  finishing: 70,
  ironing: 85,
  packing: 92,
  dispatch: 100,
};

// Static Mock Data for Orders
const MOCK_ORDERS = [
  {
    id: 'reliance-trends',
    client_name: 'Reliance Trends',
    product_name: 'Men\'s Formal Shirt',
    quantity: 1200,
    deadline: '2026-07-15',
    priority: 'urgent' as Priority,
    status: 'active' as OrderStatus,
    current_stage: 'stitching' as Stage,
    notes: 'Premium 100% Egyptian cotton fabric. Stitching details around double cuff and classic collar need extra care. Final pieces must be pressed to high standard.',
    created_at: '2026-06-10',
    manager: 'Rajesh Kumar (Stitching Head)',
    order_type: 'Wholesale Purchase Order',
  },
  {
    id: 'fabindia-export',
    client_name: 'Fabindia Export',
    product_name: 'Women\'s Kurti',
    quantity: 850,
    deadline: '2026-07-28',
    priority: 'high' as Priority,
    status: 'active' as OrderStatus,
    current_stage: 'ironing' as Stage,
    notes: 'Indigo block print fabric. Loose fit design. Handcraft tag attachments and traditional button loops are crucial.',
    created_at: '2026-06-12',
    manager: 'Suresh Dev (Pressing Supervisor)',
    order_type: 'Export Agreement',
  },
  {
    id: 'zara-india',
    client_name: 'Zara India',
    product_name: 'Slim Fit Denim Jacket',
    quantity: 2500,
    deadline: '2026-08-10',
    priority: 'medium' as Priority,
    status: 'on_hold' as OrderStatus,
    current_stage: 'cloth_received' as Stage,
    notes: 'Pre-washed heavy indigo denim. Awaiting design approval on buttons and rivet placement from corporate designer.',
    created_at: '2026-06-14',
    manager: 'Amit Patel (Fabric QC Lead)',
    order_type: 'Bulk Distribution Contract',
  },
  {
    id: 'h-m-retail',
    client_name: 'H&M Retail',
    product_name: 'Cotton Summer Dress',
    quantity: 4000,
    deadline: '2026-06-25',
    priority: 'high' as Priority,
    status: 'completed' as OrderStatus,
    current_stage: 'dispatch' as Stage,
    notes: 'Lightweight linen blend dress. Complete production completed and signed off. Dispatched in standard cartons with silica gel inserts.',
    created_at: '2026-06-01',
    manager: 'Meena Sharma (Logistics Coordinator)',
    order_type: 'Seasonal Stock Fill',
  },
];

type OrderDetails = (typeof MOCK_ORDERS)[number];

type StoredOrder = {
  id: string;
  client_name: string;
  product_name: string;
  quantity: number;
  deadline: string;
  priority: Priority;
  status: OrderStatus;
  current_stage: Stage;
  notes: string;
  created_at: string;
};

function isStoredOrder(value: unknown): value is StoredOrder {
  if (typeof value !== 'object' || value === null) return false;

  const order = value as Record<string, unknown>;
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
  const statuses: OrderStatus[] = ['active', 'delayed', 'completed', 'on_hold'];
  const stages: Stage[] = PIPELINE_STAGES.map((stage) => stage.key);

  return (
    typeof order.id === 'string' &&
    typeof order.client_name === 'string' &&
    typeof order.product_name === 'string' &&
    typeof order.quantity === 'number' &&
    typeof order.deadline === 'string' &&
    priorities.includes(order.priority as Priority) &&
    statuses.includes(order.status as OrderStatus) &&
    stages.includes(order.current_stage as Stage) &&
    typeof order.notes === 'string' &&
    typeof order.created_at === 'string'
  );
}

// Helper to format Date string beautifully
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Helper to calculate days remaining
function getDaysRemaining(deadlineStr: string): { days: number; text: string; isOverdue: boolean } {
  const today = new Date('2026-06-17'); // current local time simulation anchor
  const deadline = new Date(deadlineStr);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { days: diffDays, text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
  } else if (diffDays === 0) {
    return { days: diffDays, text: 'Due today', isOverdue: false };
  } else {
    return { days: diffDays, text: `${diffDays} days left`, isOverdue: false };
  }
}

export default function OrderDetailsPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : 'reliance-trends';

  // React State for interactive pipeline tracking simulation
  const [savedOrders, setSavedOrders] = useState<OrderDetails[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage>('stitching');
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const storedOrders = localStorage.getItem('garment_orders');

    if (storedOrders) {
      try {
        const parsedOrders: unknown = JSON.parse(storedOrders);
        if (Array.isArray(parsedOrders)) {
          const validOrders = parsedOrders.filter(isStoredOrder).map((storedOrder) => ({
            ...storedOrder,
            manager: 'Unassigned Production Supervisor',
            order_type: 'Production Order',
          }));
          setSavedOrders(validOrders);
        }
      } catch {
        setSavedOrders([]);
      }
    }

    setOrdersLoaded(true);
  }, []);

  const allOrders = [
    ...savedOrders,
    ...MOCK_ORDERS,
  ];

  // Find order in all available data, falling back only when the ID is unknown
  const matchedOrder = allOrders.find((o) => o.id.toLowerCase() === id.toLowerCase());

  useEffect(() => {
    if (!ordersLoaded) return;

    if (matchedOrder) {
      setOrder(matchedOrder);
      setCurrentStage(matchedOrder.current_stage);
    } else {
      // Dynamic fallback for custom IDs
      const formattedClient = id
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const newOrder = {
        id: id,
        client_name: formattedClient || 'Custom Client Inc.',
        product_name: 'Standard Cotton Apparel',
        quantity: 1500,
        deadline: '2026-07-20',
        priority: 'medium' as Priority,
        status: 'active' as OrderStatus,
        current_stage: 'cutting' as Stage,
        notes: 'Mock order dynamically generated. Fabric needs to be checked prior to cutting. Stitching standard sizing.',
        created_at: '2026-06-15',
        manager: 'Amit Patel (Production Head)',
        order_type: 'General Manufacturing Order',
      };
      setOrder(newOrder);
      setCurrentStage(newOrder.current_stage);
    }
  }, [id, matchedOrder, ordersLoaded]);

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20 bg-slate-950 text-slate-100">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
            <p className="text-slate-400 text-sm font-medium">Loading Order Pipeline Details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get index of the current stage
  const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.key === currentStage);
  
  // Calculate completion percentage based on current stage
  const progressPercent = STAGE_PROGRESS[currentStage] || 0;

  // Priority styling configuration
  const priorityConfig: Record<Priority, { label: string; text: string; bg: string; border: string; dot: string }> = {
    low: { label: 'Low', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', dot: 'bg-slate-500' },
    medium: { label: 'Medium', text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', dot: 'bg-sky-500' },
    high: { label: 'High', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    urgent: { label: 'Urgent', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-500' },
  };

  const currentPriority = priorityConfig[order.priority] || priorityConfig.medium;

  // Status Badge styling configurations
  const statusColors: Record<OrderStatus, { text: string; bg: string; border: string }> = {
    active: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    delayed: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    completed: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    on_hold: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  };

  const currentStatusStyle = statusColors[order.status] || statusColors.active;
  const daysInfo = getDaysRemaining(order.deadline);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12 animate-fade-in text-slate-100">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/orders" className="hover:text-indigo-400 transition-colors">Orders</Link>
              <span>/</span>
              <span className="text-slate-400">Order Detail</span>
              <span>/</span>
              <span className="text-indigo-400 font-mono">#{order.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Order Pipeline Details
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Orders
            </Link>
          </div>
        </div>

        {/* Dynamic Simulator Console Alert */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-indigo-950/20 to-slate-950 border border-indigo-500/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-indigo-950/10">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-indigo-400">
              <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-bold uppercase tracking-wider">Production Simulator Console</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              For evaluation and review, you can change the current active production stage in real time. The progress tracker, stage indicators, colors, and percentage card will update dynamically.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 shadow-inner">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider px-2">Set Stage:</span>
            <select
              value={currentStage}
              onChange={(e) => setCurrentStage(e.target.value as Stage)}
              className="bg-transparent text-xs text-indigo-400 font-bold focus:outline-none cursor-pointer pr-3"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.key} value={s.key} className="bg-slate-950 text-slate-300">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Order Core Details Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Card */}
          <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm space-y-6 shadow-md relative overflow-hidden group">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-indigo-500/10 transition-colors duration-500 pointer-events-none" />
            
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Order Client</span>
                <h2 className="text-2xl font-bold text-white mt-0.5">{order.client_name}</h2>
                <div className="flex items-center gap-2.5 mt-2">
                  <span className="text-xs text-slate-400 font-medium">{order.order_type}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <span className="text-xs font-mono text-slate-500">#{order.id.slice(0, 8)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <hr className="border-slate-800/80" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Product Description</span>
                <span className="text-slate-200 font-semibold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {order.product_name}
                </span>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Production Supervisor</span>
                <span className="text-slate-200 font-semibold text-base flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {order.manager.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  {order.manager}
                </span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/30 border border-slate-800/60 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Production Directive Notes
              </span>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                &ldquo;{order.notes}&rdquo;
              </p>
            </div>
          </div>

          {/* Quick Metrics & Progress Card */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Completion Status</h3>
                <span className="text-xs text-slate-500 font-medium">Stage {currentStageIndex + 1} of 7</span>
              </div>

              {/* Progress Circle Visual */}
              <div className="flex flex-col items-center justify-center py-4 relative">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  
                  {/* SVG Circle Background & Stroke */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-slate-900 fill-transparent"
                      strokeWidth="8"
                    />
                    {/* Main progress bar indicator */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-indigo-500 transition-all duration-700 ease-out fill-transparent"
                      strokeWidth="8"
                      strokeDasharray="263.89"
                      strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Center Text */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold tracking-tight text-white">{progressPercent}%</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Progress</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-300 font-bold">
                    Active: <span className="text-indigo-400 font-semibold">{PIPELINE_STAGES[currentStageIndex]?.label}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                    {PIPELINE_STAGES[currentStageIndex]?.desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-5 mt-4 flex items-center justify-between text-xs">
              <div className="text-slate-500">
                Created: <span className="text-slate-400 font-medium">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Auto Calculated
              </div>
            </div>
          </div>
        </div>

        {/* Stats Columns Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Stat Item: Quantity */}
          <div className="bg-slate-950/45 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Quantity</span>
              <div className="p-2 rounded-lg bg-slate-900 text-indigo-400 border border-slate-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="mt-2.5">
              <h3 className="text-2xl font-extrabold text-white font-mono">
                {order.quantity.toLocaleString()} <span className="text-xs text-slate-400 font-normal font-sans">pieces</span>
              </h3>
              <p className="text-[10.5px] text-slate-500 mt-1">
                Standard bulk packaging requested
              </p>
            </div>
          </div>

          {/* Stat Item: Deadline */}
          <div className="bg-slate-950/45 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Target Deadline</span>
              <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${daysInfo.isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2.5">
              <h3 className="text-2xl font-extrabold text-white font-mono">
                {formatDate(order.deadline)}
              </h3>
              <p className={`text-[10.5px] font-semibold mt-1 flex items-center gap-1 ${daysInfo.isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                {!daysInfo.isOverdue && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                {daysInfo.text}
              </p>
            </div>
          </div>

          {/* Stat Item: Priority */}
          <div className="bg-slate-950/45 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Priority Rank</span>
              <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${currentPriority.text}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="mt-2.5">
              <div className="flex items-center gap-2">
                <span className={`text-xl uppercase font-extrabold tracking-wider ${currentPriority.text}`}>
                  {currentPriority.label}
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${currentPriority.dot} ${order.priority === 'urgent' ? 'animate-ping' : ''}`} />
              </div>
              <p className="text-[10.5px] text-slate-500 mt-1">
                Dictates production queue ordering
              </p>
            </div>
          </div>

          {/* Stat Item: Current Stage */}
          <div className="bg-slate-950/45 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Stage</span>
              <div className="p-2 rounded-lg bg-slate-900 text-blue-400 border border-slate-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
            <div className="mt-2.5">
              <h3 className="text-xl font-extrabold text-blue-400 tracking-tight">
                {PIPELINE_STAGES[currentStageIndex]?.label}
              </h3>
              <p className="text-[10.5px] text-slate-500 mt-1 truncate">
                {PIPELINE_STAGES[currentStageIndex]?.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Production Pipeline Tracker Stepper Card */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm space-y-8 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Pipeline Stage Progress</h3>
              <p className="text-xs text-slate-500 mt-0.5">Shows status tracking and allows stage navigation simulation</p>
            </div>
            <span className="text-xs font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-indigo-400">
              Pipeline Map v1
            </span>
          </div>

          {/* Stepper Implementation */}
          <div className="py-6">
            
            {/* Horizontal Stepper (Medium & Large screens) */}
            <div className="hidden md:block relative">
              
              {/* Stepper Progress Connector Lines */}
              <div className="absolute top-5 left-0 w-full h-[3px] bg-slate-800 rounded-full -translate-y-1/2 z-0" />
              <div 
                className="absolute top-5 left-0 h-[3px] bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full -translate-y-1/2 z-0 transition-all duration-700 ease-out" 
                style={{
                  width: `${(currentStageIndex / (PIPELINE_STAGES.length - 1)) * 100}%`
                }}
              />

              <div className="relative flex justify-between items-start z-10">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  let statusText = "Future";
                  let nodeColorClass = "border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700";
                  let iconElement = <span className="font-mono text-sm">{idx + 1}</span>;

                  if (isCompleted) {
                    statusText = "Completed";
                    nodeColorClass = "border-emerald-500 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/10";
                    iconElement = (
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    );
                  } else if (isCurrent) {
                    statusText = "Current Stage";
                    nodeColorClass = "border-blue-500 bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/30";
                    iconElement = (
                      <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    );
                  }

                  return (
                    <button
                      key={stage.key}
                      onClick={() => setCurrentStage(stage.key)}
                      className="flex flex-col items-center text-center group cursor-pointer focus:outline-none w-[12%] transition-all duration-200"
                    >
                      {/* Circle Node */}
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold z-10 transition-all duration-300 ${nodeColorClass}`}>
                        {iconElement}
                      </div>

                      {/* Labels */}
                      <span className={`text-[12px] font-bold mt-3 transition-colors ${isCurrent ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                        {stage.label}
                      </span>
                      
                      <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mt-0.5">
                        {statusText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vertical Stepper (Mobile screens) */}
            <div className="block md:hidden relative">
              {/* Stepper Progress Connector line */}
              <div className="absolute top-0 left-5 w-[2px] h-full bg-slate-800 -translate-x-1/2 z-0" />
              <div 
                className="absolute top-0 left-5 w-[2px] bg-gradient-to-b from-emerald-500 to-blue-500 -translate-x-1/2 z-0 transition-all duration-700 ease-out" 
                style={{
                  height: `${(currentStageIndex / (PIPELINE_STAGES.length - 1)) * 100}%`
                }}
              />

              <div className="flex flex-col gap-6 relative z-10">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  let nodeColorClass = "border-slate-800 bg-slate-950 text-slate-500";
                  let iconElement = <span className="font-mono text-xs">{idx + 1}</span>;
                  let statusBadgeText = "Upcoming Stage";
                  let statusBadgeClass = "bg-slate-900 border border-slate-800 text-slate-500";

                  if (isCompleted) {
                    nodeColorClass = "border-emerald-500 bg-emerald-950/40 text-emerald-400";
                    iconElement = (
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    );
                    statusBadgeText = "Completed";
                    statusBadgeClass = "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
                  } else if (isCurrent) {
                    nodeColorClass = "border-blue-500 bg-blue-600 text-white ring-4 ring-blue-500/15";
                    iconElement = (
                      <svg className="w-3.5 h-3.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    );
                    statusBadgeText = "Current Active";
                    statusBadgeClass = "bg-blue-500/10 border border-blue-500/20 text-blue-400 animate-pulse";
                  }

                  return (
                    <button
                      key={stage.key}
                      onClick={() => setCurrentStage(stage.key)}
                      className="flex items-start gap-4 text-left cursor-pointer focus:outline-none w-full group transition-all"
                    >
                      {/* Node circle */}
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold shrink-0 transition-all ${nodeColorClass}`}>
                        {iconElement}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-bold ${isCurrent ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {stage.label}
                          </span>
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${statusBadgeClass}`}>
                            {statusBadgeText}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {stage.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Details Tabs & Real logs mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Mock Production Logs */}
          <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Live Production Logs</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Recent barcode scanned logs in the shop-floor pipeline</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                Shift A
              </span>
            </div>

            <div className="flow-root">
              <ul className="-mb-8">
                
                {/* Log Item 1 */}
                {currentStageIndex >= 1 && (
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-[2px] bg-slate-900" aria-hidden="true"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center ring-8 ring-slate-950">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-xs text-slate-300">
                            <span className="font-semibold text-slate-100">Cutting completed</span> by lot supervisor Rajesh Kumar.
                          </p>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                            <span>June 15, 2026 11:20 AM</span>
                            <span>•</span>
                            <span className="font-mono">Qty: {order.quantity} pcs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )}

                {/* Log Item 2 */}
                {currentStageIndex >= 2 && (
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-[2px] bg-slate-900" aria-hidden="true"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center ring-8 ring-slate-950">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-xs text-slate-300">
                            <span className="font-semibold text-slate-100">Stitching line assigned</span> to Row C stitching operators.
                          </p>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                            <span>June 16, 2026 09:30 AM</span>
                            <span>•</span>
                            <span className="font-mono">Thread: 40/2 Polyester</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )}

                {/* Log Item 3 - Current active */}
                <li>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center ring-8 ring-slate-950">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5">
                        <p className="text-xs text-slate-200 font-semibold">
                          Active processing in {PIPELINE_STAGES[currentStageIndex]?.label} stage.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {PIPELINE_STAGES[currentStageIndex]?.desc}
                        </p>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Last scanned: June 17, 2026 12:45 PM by Operator ID #902
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Specifications list */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <svg className="w-4.5 h-4.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Order Technical Info
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">Fabric Thread Count</span>
                <span className="text-slate-300 font-mono">60s Giza Cotton</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">QC Pass Threshold</span>
                <span className="text-slate-300 font-mono">98.5% Acceptance</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">Package Type</span>
                <span className="text-slate-300">Flat Hanger Pack</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">Ironing Spec</span>
                <span className="text-slate-300">Heavy Steam (Cotton Setting)</span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-slate-500">Logistics Vendor</span>
                <span className="text-indigo-400 font-semibold">GarmentFlow Express</span>
              </div>
            </div>
            
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-[11px] text-slate-500 leading-relaxed">
              💡 Technical parameters are initialized automatically from client spec sheet during pre-production phase.
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
