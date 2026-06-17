'use client';

import React from 'react';
import Link from 'next/link';

interface NavbarProps {
  currentRole: string;
  onChangeRole: (role: string) => void;
}

export default function Navbar({ currentRole, onChangeRole }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between text-white">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold tracking-wider shadow-lg shadow-indigo-500/20">
          G
        </div>
        <div>
          <span className="font-semibold text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            GarmentFlow
          </span>
          <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            v1.0 (Phase 1)
          </span>
        </div>
      </div>

      {/* Center Actions / Info */}
      <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System active</span>
        </div>
        <span className="text-slate-700">|</span>
        <span className="text-xs">Shift: Day Shift</span>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-4">
        {/* Role Quick Selector (for Phase 1 mockup/demonstration) */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <span className="text-xs text-slate-500 px-2 font-medium">Mock Role:</span>
          <select
            value={currentRole}
            onChange={(e) => onChangeRole(e.target.value)}
            className="bg-transparent text-xs text-indigo-400 font-semibold focus:outline-none cursor-pointer pr-2"
          >
            <option value="owner" className="bg-slate-900 text-slate-300">
              Owner / Factory Head
            </option>
            <option value="main_supervisor" className="bg-slate-900 text-slate-300">
              Main Supervisor
            </option>
            <option value="dept_supervisor" className="bg-slate-900 text-slate-300">
              Dept Supervisor (Stitching)
            </option>
          </select>
        </div>

        {/* User Info Mockup */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-200">
              {currentRole === 'owner'
                ? 'Avni Malik'
                : currentRole === 'main_supervisor'
                ? 'Rajesh Kumar'
                : 'Amit Patel'}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              {currentRole.replace('_', ' ')}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
            {currentRole === 'owner' ? 'AM' : currentRole === 'main_supervisor' ? 'RK' : 'AP'}
          </div>
        </div>
      </div>
    </nav>
  );
}
