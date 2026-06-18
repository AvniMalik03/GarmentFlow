import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Home() {
  const kpis = [
    {
      title: "Total Orders",
      value: 24,
      description: "All system orders",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      colorClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      hoverClass: "hover:border-indigo-500/30 hover:shadow-indigo-500/5",
    },
    {
      title: "Active Orders",
      value: 12,
      description: "In production pipeline",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.283 8H18" />
        </svg>
      ),
      colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      hoverClass: "hover:border-blue-500/30 hover:shadow-blue-500/5",
      isLive: true,
    },
    {
      title: "Completed Orders",
      value: 8,
      description: "Dispatched or ready",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      hoverClass: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
    },
    {
      title: "Delayed Orders",
      value: 4,
      description: "Requires attention",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      hoverClass: "hover:border-rose-500/30 hover:shadow-rose-500/5",
      isWarning: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/20 p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          {/* Subtle background glow */}
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Garment Production Tracking System
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-medium">
                Track garment production from cloth receiving to final dispatch.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2.5 px-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Operational</span>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/60 group ${kpi.hoverClass}`}
            >
              {/* Decorative background circle */}
              <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-slate-800/10 group-hover:bg-slate-800/20 transition-all duration-300" />
              
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                    {kpi.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {kpi.value}
                    </span>
                    {kpi.isLive && (
                      <span className="flex h-2 w-2 items-center justify-center relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                      </span>
                    )}
                    {kpi.isWarning && (
                      <span className="flex h-2 w-2 items-center justify-center relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {kpi.description}
                  </p>
                </div>
                
                <div className={`p-2.5 rounded-xl border transition-all duration-300 ${kpi.colorClass}`}>
                  {kpi.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

