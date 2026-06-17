'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [role, setRole] = useState<string>('owner');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    // Read from localStorage to persist mock role selection during design review
    const storedRole = localStorage.getItem('mock_user_role');
    if (storedRole) {
      setRole(storedRole);
    }
    setMounted(true);
  }, []);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    localStorage.setItem('mock_user_role', newRole);
    // Reload or dispatch event so current page can adapt if needed
    window.dispatchEvent(new Event('mock_role_changed'));
  };

  if (!mounted) {
    // Avoid hydration mismatch by rendering a loader/skeleton on server
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Loading GarmentFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar currentRole={role} onChangeRole={handleRoleChange} />

      {/* Main Layout Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar currentRole={role} />

        {/* Content Container */}
        <main className="flex-1 p-6 md:p-8 bg-slate-900/30 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
