'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Stage, Priority, OrderStatus } from '@/types';

type SavedOrder = {
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

// Define sequence and display label of stages
const STAGES_CONFIG: Record<Stage, { label: string; index: number }> = {
  cloth_received: { label: 'Cloth Received', index: 1 },
  cutting: { label: 'Cutting', index: 2 },
  stitching: { label: 'Stitching', index: 3 },
  finishing: { label: 'Finishing', index: 4 },
  ironing: { label: 'Ironing', index: 5 },
  packing: { label: 'Packing', index: 6 },
  dispatch: { label: 'Dispatch', index: 7 },
};

// Custom stage progress percentages mapping (corresponds to details page)
const STAGE_PROGRESS: Record<Stage, number> = {
  cloth_received: 15,
  cutting: 30,
  stitching: 55,
  finishing: 70,
  ironing: 85,
  packing: 92,
  dispatch: 100,
};

// Static Mock Data matching the Details Page for consistency
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
    notes: 'Premium Giza Cotton.',
    created_at: '2026-06-10',
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
    notes: 'Indigo block print kurtis.',
    created_at: '2026-06-12',
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
    notes: 'Pre-washed heavy indigo denim.',
    created_at: '2026-06-14',
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
    notes: 'Bulk summer dress packing completed.',
    created_at: '2026-06-01',
  },
];


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

function isSavedOrder(value: unknown): value is SavedOrder {
  if (typeof value !== 'object' || value === null) return false;

  const order = value as Record<string, unknown>;
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
  const statuses: OrderStatus[] = ['active', 'delayed', 'completed', 'on_hold'];
  const stages: Stage[] = Object.keys(STAGES_CONFIG) as Stage[];

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

export default function OrdersPage() {
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('deadline');

  useEffect(() => {
    const storedOrders = localStorage.getItem('garment_orders');
    if (!storedOrders) return;

    try {
      const parsedOrders: unknown = JSON.parse(storedOrders);
      if (Array.isArray(parsedOrders)) {
        setSavedOrders(parsedOrders.filter(isSavedOrder));
      }
    } catch {
      setSavedOrders([]);
    }
  }, []);

  const allOrders = [
    ...savedOrders,
    ...MOCK_ORDERS,
  ];

  // Filter & Sort Logic
  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch = 
      order.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      order.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    } else if (sortBy === 'quantity') {
      return b.quantity - a.quantity;
    } else if (sortBy === 'client_name') {
      return a.client_name.localeCompare(b.client_name);
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Styles configuration
  const priorityStyles: Record<Priority, { text: string; bg: string; border: string }> = {
    low: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    medium: { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    high: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    urgent: { text: 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  };

  const statusStyles: Record<OrderStatus, { label: string; text: string; bg: string; border: string; dot: string }> = {
    active: { label: 'Active', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
    delayed: { label: 'Delayed', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' },
    completed: { label: 'Completed', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    on_hold: { label: 'On Hold', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12 animate-fade-in text-slate-100">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Production Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage, search, and monitor bulk production pipelines across the factory floor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {filteredOrders.length} Order(s) Loaded
            </span>
          </div>
        </div>

        {/* Filter & Search Controls bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-slate-800/80 rounded-xl bg-slate-950/20 backdrop-blur-sm">
          {/* Search field */}
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search client, product or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Group filters */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto w-full md:w-auto">
            {/* Status Selector */}
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="delayed">Delayed</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="deadline">Deadline</option>
                <option value="quantity">Quantity</option>
                <option value="client_name">Client Name</option>
                <option value="created_at">Date Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 border border-slate-800 border-dashed rounded-xl bg-slate-950/20">
            <svg className="w-12 h-12 text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-4 text-sm font-bold text-slate-300">No Orders Found</h3>
            <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto">
              We couldn&apos;t find any orders matching &ldquo;{searchQuery}&rdquo;. Try checking filters or typing another term.
            </p>
          </div>
        ) : (
          /* Orders Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOrders.map((order) => {
              const daysInfo = getDeadlineInfo(order.deadline);
              const progressVal = STAGE_PROGRESS[order.current_stage] || 0;
              const stageInfo = STAGES_CONFIG[order.current_stage] || { label: 'Unknown', index: 0 };
              const priorityDetail = priorityStyles[order.priority] || priorityStyles.medium;
              const statusDetail = statusStyles[order.status] || statusStyles.active;

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/60 rounded-xl p-5 md:p-6 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:shadow-indigo-950/15 flex flex-col justify-between relative overflow-hidden group"
                >
                  {/* Subtle top background highlight on hover */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="space-y-4">
                    {/* Top Row: Client Name & Status Badge */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {order.client_name}
                        </h3>
                        <p className="text-[10.5px] font-mono text-slate-500 mt-0.5">#{order.id.slice(0, 8)}</p>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${statusDetail.bg} ${statusDetail.text} ${statusDetail.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDetail.dot}`} />
                        {statusDetail.label}
                      </span>
                    </div>

                    {/* Middle stats grid */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/20 border border-slate-900 rounded-lg p-3">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Product</span>
                        <span className="text-xs text-slate-200 font-semibold truncate block">
                          {order.product_name}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Quantity</span>
                        <span className="text-xs text-slate-200 font-mono font-bold block">
                          {order.quantity.toLocaleString()} pcs
                        </span>
                      </div>
                    </div>

                    {/* Stage & Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Stage</span>
                          <span className="text-xs text-blue-400 font-semibold">{stageInfo.label}</span>
                          <span className="text-[10px] text-slate-600 font-medium">({stageInfo.index}/7)</span>
                        </div>
                        <span className="font-mono font-bold text-slate-300 text-xs">{progressVal}%</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Row: Priority, Deadline and Action hover button */}
                  <div className="border-t border-slate-900 pt-4 mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Priority Tag */}
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${priorityDetail.text} ${priorityDetail.bg} ${priorityDetail.border}`}>
                        {order.priority}
                      </span>

                      {/* Deadline info */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Deadline</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold border ${daysInfo.bgStyle} ${daysInfo.textStyle} ${daysInfo.borderStyle}`}>
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
                    </div>

                    {/* Hover pipeline label */}
                    <div className="text-xs font-bold text-slate-500 group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                      <span>Pipeline</span>
                      <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
