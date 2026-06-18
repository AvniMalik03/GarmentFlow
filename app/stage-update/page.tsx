'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function StageUpdatePlaceholder() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12 animate-fade-in text-slate-100">
        <div className="border-b border-slate-900 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Stage Update
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Log progress updates for bundles transition between assembly stages.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 border border-slate-800 border-dashed rounded-2xl bg-slate-950/20 max-w-4xl mx-auto p-8 text-center space-y-4">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-200">Coming Soon in Phase 2</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Supervisors will be able to update bundle status, track parts allocation, and record processing times per operator.
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
