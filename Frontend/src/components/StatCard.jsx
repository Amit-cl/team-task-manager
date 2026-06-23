import React from "react";

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
      <h2 className="text-4xl font-bold text-slate-800 mt-2">{value ?? 0}</h2>
    </div>
  );
}

export default StatCard;
