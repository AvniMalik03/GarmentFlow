import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Home() {
  // ── KPI Data ──────────────────────────────────────────────────────────────
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
      accentColor: "indigo",
      bgClass: "bg-indigo-50",
      iconBgClass: "bg-indigo-100 text-indigo-600",
      borderAccent: "border-indigo-500",
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
      accentColor: "blue",
      bgClass: "bg-blue-50",
      iconBgClass: "bg-blue-100 text-blue-600",
      borderAccent: "border-blue-500",
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
      accentColor: "emerald",
      bgClass: "bg-emerald-50",
      iconBgClass: "bg-emerald-100 text-emerald-600",
      borderAccent: "border-emerald-500",
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
      accentColor: "rose",
      bgClass: "bg-rose-50",
      iconBgClass: "bg-rose-100 text-rose-600",
      borderAccent: "border-rose-500",
      isWarning: true,
    },
  ];

  // ── Production Pipeline Stages ────────────────────────────────────────────
  const pipelineStages = [
    { label: "Cloth Received", count: 3, icon: "📦" },
    { label: "Cutting", count: 2, icon: "✂️" },
    { label: "Stitching", count: 4, icon: "🧵" },
    { label: "QC", count: 1, icon: "🔍" },
    { label: "Ironing", count: 1, icon: "♨️" },
    { label: "Packing", count: 1, icon: "📋" },
    { label: "Dispatch", count: 0, icon: "🚚" },
  ];

  // ── Recent Activity ───────────────────────────────────────────────────────
  const recentActivity = [
    {
      title: "Order #1042 moved to Stitching",
      time: "2 hours ago",
      stage: "Stitching",
      stageColor: "bg-blue-100 text-blue-700",
      iconColor: "bg-blue-100 text-blue-600",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: "QC inspection completed for Order #1038",
      time: "5 hours ago",
      stage: "QC",
      stageColor: "bg-emerald-100 text-emerald-700",
      iconColor: "bg-emerald-100 text-emerald-600",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Dispatch scheduled for Order #1035",
      time: "8 hours ago",
      stage: "Dispatch",
      stageColor: "bg-indigo-100 text-indigo-700",
      iconColor: "bg-indigo-100 text-indigo-600",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      title: "New order #1043 created",
      time: "1 day ago",
      stage: "New",
      stageColor: "bg-slate-100 text-slate-600",
      iconColor: "bg-slate-100 text-slate-500",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Order #1037 moved to Ironing",
      time: "1 day ago",
      stage: "Ironing",
      stageColor: "bg-amber-100 text-amber-700",
      iconColor: "bg-amber-100 text-amber-600",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  // ── Alerts ────────────────────────────────────────────────────────────────
  const alerts = [
    {
      title: "3 orders delayed",
      description: "Orders #1031, #1033, #1036 have exceeded estimated completion time.",
      severity: "error" as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      title: "2 pending QC inspections",
      description: "Orders #1039 and #1041 are awaiting quality check clearance.",
      severity: "warning" as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Cutting dept at 90% capacity",
      description: "Consider redistributing workload or adding temporary staff.",
      severity: "info" as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const severityStyles = {
    error: {
      border: "border-l-rose-500",
      bg: "bg-rose-50",
      iconBg: "bg-rose-100 text-rose-600",
      title: "text-rose-800",
      desc: "text-rose-600",
    },
    warning: {
      border: "border-l-amber-500",
      bg: "bg-amber-50",
      iconBg: "bg-amber-100 text-amber-600",
      title: "text-amber-800",
      desc: "text-amber-600",
    },
    info: {
      border: "border-l-blue-500",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100 text-blue-600",
      title: "text-blue-800",
      desc: "text-blue-600",
    },
  };

  return (
    <DashboardLayout>
      {/* ── Light-theme dashboard container ─────────────────────────────── */}
      <div className="min-h-[calc(100vh-140px)] bg-slate-100 -m-6 md:-m-8 p-6 md:p-8 rounded-xl">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 1: Welcome Header
              ═══════════════════════════════════════════════════════════════ */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-md">
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-400" />

            <div className="pl-7 pr-6 py-6 md:py-8 md:pr-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  Garment Production Tracking System
                </h1>
                <p className="text-slate-500 text-sm md:text-base font-medium">
                  Track garment production from cloth receiving to final dispatch.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2.5 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>System Operational</span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 2: KPI Cards
              ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300"
              >
                {/* Top accent line */}
                <div className={`absolute top-0 left-4 right-4 h-0.5 ${kpi.borderAccent} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wider uppercase text-slate-700">
                      {kpi.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
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
                    <p className="text-xs text-slate-600 font-medium">
                      {kpi.description}
                    </p>
                  </div>

                  <div className={`p-2.5 rounded-xl ${kpi.iconBgClass} transition-all duration-300`}>
                    {kpi.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 3: Production Pipeline Overview
              ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Production Pipeline</h2>
                <p className="text-sm text-slate-500 mt-0.5">Current order distribution across stages</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Live Overview
              </div>
            </div>

            {/* Pipeline Flow */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-0">
              {pipelineStages.map((stage, idx) => (
                <div key={idx} className="flex items-center">
                  {/* Stage Node */}
                  <div className="group flex flex-col items-center gap-2">
                    <div className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300 cursor-default ${
                      stage.count > 0
                        ? "bg-indigo-50 border-indigo-200 hover:border-indigo-300 hover:shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}>
                      <span className="text-lg">{stage.icon}</span>
                      <div>
                        <p className={`text-xs font-semibold ${stage.count > 0 ? "text-indigo-900" : "text-slate-500"}`}>
                          {stage.label}
                        </p>
                        <p className={`text-[11px] font-bold ${stage.count > 0 ? "text-indigo-600" : "text-slate-400"}`}>
                          {stage.count} {stage.count === 1 ? "order" : "orders"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Connector */}
                  {idx < pipelineStages.length - 1 && (
                    <div className="hidden md:flex items-center mx-1">
                      <div className="w-6 h-px bg-slate-300" />
                      <svg className="w-3 h-3 text-slate-400 -ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 4 & 5: Recent Activity + Alerts (Two Columns)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Recent Activity (3/5 width) ──────────────────────────── */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-md p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Latest factory events</p>
                </div>
                <div className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer transition-colors">
                  View all →
                </div>
              </div>

              <div className="space-y-2.5">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200"
                  >
                    {/* Icon */}
                    <div className={`shrink-0 p-2 rounded-lg ${activity.iconColor}`}>
                      {activity.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {activity.time}
                      </p>
                    </div>

                    {/* Stage Badge */}
                    <div className={`hidden sm:block shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${activity.stageColor}`}>
                      {activity.stage}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Alerts Panel (2/5 width) ─────────────────────────────── */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-md p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Alerts</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Items needing attention</p>
                </div>
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600 text-xs font-bold">
                  {alerts.length}
                </div>
              </div>

              <div className="space-y-3">
                {alerts.map((alert, idx) => {
                  const style = severityStyles[alert.severity];
                  return (
                    <div
                      key={idx}
                      className={`relative rounded-xl border border-slate-100 ${style.bg} p-4 border-l-4 ${style.border} transition-all duration-200 hover:shadow-sm`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 p-1.5 rounded-lg ${style.iconBg}`}>
                          {alert.icon}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${style.title}`}>
                            {alert.title}
                          </p>
                          <p className={`text-xs mt-1 ${style.desc} leading-relaxed`}>
                            {alert.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
