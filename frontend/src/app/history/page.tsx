"use client";

import { useEffect, useState } from "react";
import { getHistory, getWomen, Assessment, Woman } from "@/lib/api";
import { CheckCircle, AlertCircle, AlertTriangle, Search, Info } from "lucide-react";

const RISK_CONFIG = {
  low: { icon: CheckCircle, color: "text-teal-600", badge: "badge-low", label: "Low" },
  moderate: { icon: AlertCircle, color: "text-amber-600", badge: "badge-moderate", label: "Moderate" },
  high: { icon: AlertTriangle, color: "text-rose-600", badge: "badge-high", label: "High" },
};

function fmt(dt: string) {
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [women, setWomen] = useState<Woman[]>([]);
  const [filterWoman, setFilterWoman] = useState("");
  const [filterRisk, setFilterRisk] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getWomen(), getHistory()])
      .then(([w, a]) => {
        setWomen(w);
        setAssessments(a);
      })
      .catch(() => setError("Failed to load history."))
      .finally(() => setLoading(false));
  }, []);

  async function applyFilter() {
    setLoading(true);
    try {
      const data = await getHistory(
        filterWoman ? Number(filterWoman) : undefined,
        filterRisk || undefined
      );
      setAssessments(data);
    } catch {
      setError("Failed to filter history.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Assessment History</h1>
        <p className="page-subtitle">All symptom assessments across the program</p>
      </div>

      {/* Filters */}
      <div className="card flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <label className="label">Filter by Woman</label>
          <select className="input" value={filterWoman} onChange={(e) => setFilterWoman(e.target.value)}>
            <option value="">All Women</option>
            {women.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} — {w.village}
              </option>
            ))}
          </select>
        </div>
        <div className="w-44">
          <label className="label">Filter by Risk</label>
          <select className="input" value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
            <option value="">All Levels</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={applyFilter}>
          <Search size={14} /> Apply Filter
        </button>
        <button
          className="btn-secondary text-sm"
          onClick={() => {
            setFilterWoman("");
            setFilterRisk("");
            getHistory().then(setAssessments);
          }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="card bg-rose-50 border-rose-200">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
        </div>
      ) : assessments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-stone-400 text-sm">No assessments found.</p>
          <a href="/symptoms" className="text-rose-600 text-sm hover:underline mt-2 inline-block">
            Log symptoms to create one →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => {
            const cfg = RISK_CONFIG[a.risk_level];
            const Icon = cfg.icon;
            const open = expanded === a.id;
            return (
              <div key={a.id} className="card cursor-pointer" onClick={() => setExpanded(open ? null : a.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${cfg.color} flex-shrink-0`} />
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{a.woman_name || `Woman #${a.woman_id}`}</p>
                      <p className="text-xs text-stone-400">{a.woman_village} · {fmt(a.assessed_on)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cfg.badge}>{cfg.label}</span>
                    {a.referral_needed && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Referral
                      </span>
                    )}
                    <span className="text-stone-300 text-xs ml-2">{open ? "▲" : "▼"}</span>
                  </div>
                </div>

                {open && (
                  <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                    {a.referral_reason && (
                      <div className="bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                        <p className="text-xs font-semibold text-amber-700">Referral Reason</p>
                        <p className="text-xs text-amber-600 mt-0.5">{a.referral_reason}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-stone-600 flex items-center gap-1 mb-2">
                        <Info size={12} /> Awareness Messages
                      </p>
                      <ul className="space-y-1.5">
                        {a.awareness_messages.map((msg, i) => (
                          <li key={i} className="text-xs text-stone-600 flex items-start gap-1.5">
                            <span className="text-rose-400 mt-0.5">•</span>
                            {msg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
