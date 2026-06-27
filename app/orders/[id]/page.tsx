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

// Helper to format Date as "D MMMM YYYY", e.g., "28 June 2026"
function formatFullDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Helper to calculate days remaining and styles
function getDeadlineInfo(deadlineStr: string) {
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let deadlineMidnight: Date;
  const parts = deadlineStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    deadlineMidnight = new Date(year, month, day);
  } else {
    const deadline = new Date(deadlineStr);
    deadlineMidnight = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  }

  if (isNaN(deadlineMidnight.getTime())) {
    return {
      daysRemaining: 0,
      daysText: 'Invalid Date',
      status: 'On Schedule' as const,
      isOverdue: false,
      textStyle: 'text-slate-400',
      bgStyle: 'bg-slate-500/10',
      borderStyle: 'border-slate-500/20',
      dotStyle: 'bg-slate-500',
      iconColor: 'text-slate-400',
    };
  }

  const diffTime = deadlineMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let daysText = '';
  let status: 'On Schedule' | 'Approaching Deadline' | 'Urgent' | 'Overdue' = 'On Schedule';
  let isOverdue = false;

  let textStyle = '';
  let bgStyle = '';
  let borderStyle = '';
  let dotStyle = '';
  let iconColor = '';

  if (diffDays < 0) {
    isOverdue = true;
    const absDays = Math.abs(diffDays);
    daysText = `${absDays} ${absDays === 1 ? 'Day' : 'Days'} Overdue`;
    status = 'Overdue';
    
    // Dark Red
    textStyle = 'text-red-400';
    bgStyle = 'bg-red-950/40';
    borderStyle = 'border-red-900/50';
    dotStyle = 'bg-red-500';
    iconColor = 'text-red-400';
  } else if (diffDays === 0) {
    daysText = 'Due Today';
    status = 'Urgent';
    
    // Red (Rose)
    textStyle = 'text-rose-400';
    bgStyle = 'bg-rose-500/10';
    borderStyle = 'border-rose-500/20';
    dotStyle = 'bg-rose-500';
    iconColor = 'text-rose-400';
  } else {
    daysText = `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} Left`;
    if (diffDays > 7) {
      status = 'On Schedule';
      // Green (Emerald)
      textStyle = 'text-emerald-400';
      bgStyle = 'bg-emerald-500/10';
      borderStyle = 'border-emerald-500/20';
      dotStyle = 'bg-emerald-500';
      iconColor = 'text-emerald-400';
    } else if (diffDays >= 3 && diffDays <= 7) {
      status = 'Approaching Deadline';
      // Amber
      textStyle = 'text-amber-400';
      bgStyle = 'bg-amber-500/10';
      borderStyle = 'border-amber-500/20';
      dotStyle = 'bg-amber-500';
      iconColor = 'text-amber-400';
    } else {
      status = 'Urgent';
      // Red (Rose)
      textStyle = 'text-rose-400';
      bgStyle = 'bg-rose-500/10';
      borderStyle = 'border-rose-500/20';
      dotStyle = 'bg-rose-500';
      iconColor = 'text-rose-400';
    }
  }

  return {
    daysRemaining: diffDays,
    daysText,
    status,
    isOverdue,
    textStyle,
    bgStyle,
    borderStyle,
    dotStyle,
    iconColor,
  };
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
  const daysInfo = getDeadlineInfo(order.deadline);

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

        {/* Read-only vertical production timeline */}
        <ProductionTimeline stages={PIPELINE_STAGES} currentStage={currentStage} />

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

          {/* Stat Item: Production Deadline */}
          <div className="bg-slate-950/45 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 transition-colors duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Production Deadline</span>
              <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${daysInfo.iconColor}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Deadline Date</span>
                <span className="text-base font-extrabold text-white tracking-tight">
                  {formatFullDate(order.deadline)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Days Remaining</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${daysInfo.bgStyle} ${daysInfo.textStyle} ${daysInfo.borderStyle}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {daysInfo.isOverdue ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  {daysInfo.daysText}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${daysInfo.bgStyle} ${daysInfo.textStyle} ${daysInfo.borderStyle}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${daysInfo.dotStyle}`} />
                  {daysInfo.status}
                </span>
              </div>
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

        {/* Production Stage Breakdown Analytics */}
        <ProductionStageBreakdown totalQuantity={order.quantity} currentStage={currentStage} />

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

// ─── Mock piece-count data per stage ──────────────────────────────────────────
// Each entry: [completed, total] pieces. Values are illustrative and static.
const STAGE_PIECE_DATA: Record<Stage, { icon: string; completed: number; total: number }> = {
  cloth_received: { icon: '📦', completed: 670, total: 670 },
  cutting:        { icon: '✂️',  completed: 670, total: 670 },
  stitching:      { icon: '🧵', completed: 570, total: 670 },
  finishing:      { icon: '🪡', completed: 420, total: 570 },
  ironing:        { icon: '🔥', completed: 280, total: 420 },
  packing:        { icon: '📦', completed: 120, total: 280 },
  dispatch:       { icon: '🚚', completed: 50,  total: 120 },
};

function ProductionStageBreakdown({
  totalQuantity,
  currentStage,
}: {
  totalQuantity: number;
  currentStage: Stage;
}) {
  const currentIndex = PIPELINE_STAGES.findIndex((s) => s.key === currentStage);

  // Scale mock piece data proportionally to the real order quantity
  const scale = totalQuantity / 670;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-md backdrop-blur-sm md:p-8">
      {/* Section header */}
      <div className="mb-7 flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
          Piece-level Analytics
        </p>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-100">Production Stage Breakdown</h2>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Live Mock
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Tracks how many garment pieces have passed through each production stage.
        </p>
      </div>

      {/* Stage rows */}
      <div className="space-y-3">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent   = idx === currentIndex;
          const isUpcoming  = idx > currentIndex;

          const raw = STAGE_PIECE_DATA[stage.key];
          const completed = Math.round(raw.completed * scale);
          const total     = Math.round(raw.total     * scale);
          const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

          // Badge
          let badgeClass = '';
          let badgeLabel = '';
          if (isCompleted) {
            badgeClass = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
            badgeLabel = 'Completed';
          } else if (isCurrent) {
            badgeClass = 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300';
            badgeLabel = 'Current Stage';
          } else {
            badgeClass = 'border-slate-700 bg-slate-900 text-slate-500';
            badgeLabel = 'Upcoming';
          }

          // Row highlight
          const rowClass = isCurrent
            ? 'border-indigo-500/20 bg-indigo-500/[0.06] hover:border-indigo-400/30'
            : 'border-slate-800/60 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50';

          // Progress bar colour
          const barColor = isCompleted
            ? 'bg-emerald-500'
            : isCurrent
            ? 'bg-indigo-500'
            : 'bg-slate-600';

          return (
            <div
              key={stage.key}
              className={`group rounded-xl border px-4 py-4 transition-all duration-200 ${rowClass}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">

                {/* Left: icon + name + pieces */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Icon bubble */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg transition-all duration-300 ${
                      isCompleted
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : isCurrent
                        ? 'border-indigo-500/50 bg-indigo-600/20'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                    aria-hidden="true"
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="leading-none">{raw.icon}</span>
                    )}
                  </div>

                  {/* Name & piece count */}
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold ${
                        isCompleted ? 'text-emerald-300' : isCurrent ? 'text-indigo-300' : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-300">{completed.toLocaleString()}</span>
                      <span className="mx-1 text-slate-600">/</span>
                      <span className="font-mono">{total.toLocaleString()}</span>
                      <span className="ml-1 text-slate-600">Pieces</span>
                    </p>
                  </div>
                </div>

                {/* Right: badge */}
                <span
                  className={`shrink-0 self-start rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:self-auto ${
                    badgeClass
                  }`}
                >
                  {badgeLabel}
                </span>
              </div>

              {/* Progress bar row */}
              <div className="mt-3 flex items-center gap-3">
                {/* Track */}
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out ${
                      barColor
                    } ${isCurrent ? 'animate-pulse' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {/* Percentage label */}
                <span
                  className={`w-10 shrink-0 text-right text-xs font-bold tabular-nums ${
                    isCompleted ? 'text-emerald-400' : isCurrent ? 'text-indigo-400' : 'text-slate-500'
                  }`}
                >
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="mt-5 text-[11px] text-slate-600">
        💡 Piece counts reflect cumulative throughput at each stage gate. Figures update as stages advance.
      </p>
    </section>
  );
}

function ProductionTimeline({
  stages,
  currentStage,
}: {
  stages: typeof PIPELINE_STAGES;
  currentStage: Stage;
}) {
  const currentIndex = stages.findIndex((stage) => stage.key === currentStage);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-md backdrop-blur-sm sm:p-6 md:p-8">
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
          Manufacturing Progress
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-100">Production Timeline</h2>
        <p className="mt-1 text-xs text-slate-500">
          Stage-by-stage status for this production order.
        </p>
      </div>

      <ol className="mx-auto max-w-3xl" aria-label="Production Timeline">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === stages.length - 1;

          return (
            <li
              key={stage.key}
              className={`group relative flex gap-4 ${isLast ? '' : 'pb-5 sm:pb-6'}`}
            >
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 transition-colors duration-500 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                />
              )}

              <div className="relative z-10 shrink-0">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-105 ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/20'
                      : isCurrent
                        ? 'border-indigo-400 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/10'
                        : 'border-slate-700 bg-slate-900 text-slate-600 group-hover:border-slate-600 group-hover:text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <span className="relative flex h-3 w-3" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                    </span>
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-current" aria-hidden="true" />
                  )}
                </div>
              </div>

              <div
                className={`min-w-0 flex-1 rounded-xl border px-4 py-3 transition-all duration-300 sm:flex sm:items-center sm:justify-between sm:gap-4 ${
                  isCompleted
                    ? 'border-emerald-500/15 bg-emerald-500/[0.04] group-hover:border-emerald-500/30'
                    : isCurrent
                      ? 'border-indigo-500/30 bg-indigo-500/10 shadow-sm shadow-indigo-950/40 group-hover:border-indigo-400/50'
                      : 'border-slate-800/80 bg-slate-900/35 group-hover:border-slate-700 group-hover:bg-slate-900/55'
                }`}
              >
                <div className="min-w-0">
                  <h3 className={`text-sm font-bold ${isCompleted ? 'text-emerald-300' : isCurrent ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {stage.label}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-slate-600 sm:max-w-md">{stage.desc}</p>
                </div>
                <span
                  className={`mt-2 inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider sm:mt-0 ${
                    isCompleted
                      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                      : isCurrent
                        ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300'
                        : 'border-slate-800 bg-slate-900 text-slate-600'
                  }`}
                >
                  {isCompleted ? 'Completed' : isCurrent ? 'Current Stage' : 'Pending'}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
