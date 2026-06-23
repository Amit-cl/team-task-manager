import React from "react";

// FIX 2: StatCard with icons and accent colors
const iconMap = {
  "Total Projects": { icon: "📁", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  "Total Members":  { icon: "👥", bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
  "Total Tasks":    { icon: "📋", bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-100"  },
  "Completed":      { icon: "✅", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  "Overdue":        { icon: "⚠️", bg: "bg-red-50",    text: "text-red-600",    border: "border-red-100"    },
  "My Projects":    { icon: "📁", bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100"   },
  "My Tasks":       { icon: "📋", bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-100"  },
};

function StatCard({ title, value }) {
  const style = iconMap[title] || { icon: "📊", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" };

  return (
    <div className={`bg-white rounded-2xl border ${style.border} p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200`}>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${style.bg} mb-3`}>
        <span className="text-xl">{style.icon}</span>
      </div>
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
      <h2 className={`text-4xl font-bold mt-1 ${style.text}`}>{value ?? 0}</h2>
    </div>
  );
}

export default StatCard;
