'use client';

import React from 'react';
import Link from 'next/link';
import { Order } from '@/types';
import { StatusBadge } from './StatusBadge';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const priorityColors: Record<string, string> = {
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    medium: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse',
  };

  return (
    <tr className="hover:bg-slate-900/30 transition-colors duration-150 group">
      <td className="px-6 py-4">
        <Link href={`/orders/${order.id}`} className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
          {order.client_name}
        </Link>
        <p className="text-xs text-slate-500 mt-0.5">#{order.id.slice(0, 8)}</p>
      </td>
      <td className="px-6 py-4 font-medium text-slate-200">
        {order.product_name}
      </td>
      <td className="px-6 py-4 font-mono text-slate-300">
        {order.quantity.toLocaleString()} pcs
      </td>
      <td className="px-6 py-4 text-slate-400">
        {new Date(order.deadline).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </td>
      <td className="px-6 py-4">
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${priorityColors[order.priority]}`}>
          {order.priority}
        </span>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-6 py-4 text-right">
        <Link
          href={`/orders/${order.id}`}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          View Pipeline
        </Link>
      </td>
    </tr>
  );
}
