'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function QCPlaceholder() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12 animate-fade-in text-slate-100">
        <div className="border-b border-slate-900 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            QC Inspection
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Perform quality checks, log defects, and track reject stats.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 border border-slate-800 border-dashed rounded-2xl bg-slate-950/20 max-w-4xl mx-auto p-8 text-center space-y-4">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-200">Coming Soon in Phase 2</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            The Quality Control subsystem will allow supervisors to record defect parameters, trigger re-work loops, and monitor defect density metrics.
          </p>
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-500">
              Module Under Construction
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
