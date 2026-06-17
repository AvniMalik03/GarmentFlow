'use client';

import React from 'react';
import OrderCard from './OrderCard';
import { Order } from '@/types';

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40 backdrop-blur-sm">
      <table className="w-full border-collapse text-left text-sm text-slate-300">
        <thead className="bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="px-6 py-4">Client / Order ID</th>
            <th className="px-6 py-4">Product Name</th>
            <th className="px-6 py-4">Quantity</th>
            <th className="px-6 py-4">Deadline</th>
            <th className="px-6 py-4">Priority</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                No orders found matching the filter.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
