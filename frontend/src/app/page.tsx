"use client";

import { useEffect, useState } from "react";
import { getDashboard, DashboardSummary } from "@/lib/api";
import { Users, Baby, AlertTriangle, Bell, MapPin, TrendingUp } from "lucide-react";
import Link from "next/link";

const RISK_BADGE: Record<string, string> = {
  low: "badge-low",
  moderate: "badge-moderate",
  high: "badge-high",
};

const RISK_LABEL: Record<string, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

function fmt(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError("Could not connect to the backend. Make sure the FastAPI server is running on port 8000."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-rose-200 bg-rose-50 text-rose-700 mt-4">
        <p className="font-semibold">Connection Error</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Registered Women",
      value: data.total_women,
      icon: Users,
      color: "text-rose-600",
      bg: "bg-rose-50",
      link: "/register",
    },
    {
      label: "Pregnant Women",
      value: data.pregnant_women,
      icon: Baby,
      color: "text-teal-600",
      bg: "bg-teal-50",
      link: null,
    },
    {
      label: "High Risk Assessments",
      value: data.high_risk_count,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      link: "/history",
    },
    {
      label: "Unresolved Alerts",
      value: data.unresolved_alerts,
      icon: Bell,
      color: "text-rose-600",
      bg: "bg-rose-50",
      link: "/alerts",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your community's health awareness program</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{s.value}</p>
              <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Assessments */}
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              Recent Assessments
            </h2>
            <Link href="/history" className="text-xs text-rose-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          {data.recent_assessments.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">
              No assessments yet. <Link href="/symptoms" className="text-rose-600 hover:underline">Log symptoms</Link> to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recent_assessments.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{a.woman_name || "—"}</p>
                    <p className="text-xs text-stone-400">{a.woman_village} · {fmt(a.assessed_on)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={RISK_BADGE[a.risk_level]}>{RISK_LABEL[a.risk_level]}</span>
                    {a.referral_needed && (
                      <span className="text-xs text-amber-600 font-medium">Referral</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Village Breakdown */}
        <div className="card">
          <h2 className="font-semibold text-stone-800 flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-rose-500" />
            By Village
          </h2>
          {data.village_breakdown.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">No registrations yet.</p>
          ) : (
            <div className="space-y-3">
              {data.village_breakdown.map((v) => (
                <div key={v.village}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600 font-medium truncate">{v.village}</span>
                    <span className="text-stone-400 ml-2">{v.count}</span>
                  </div>
                  <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (v.count / Math.max(...data.village_breakdown.map(x => x.count))) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="font-semibold text-stone-800 mb-4">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/register" className="btn-primary text-sm">
            + Register New Woman
          </Link>
          <Link href="/symptoms" className="btn-secondary text-sm">
            Log Symptoms
          </Link>
          <Link href="/alerts" className="btn-teal text-sm">
            View Alerts
          </Link>
        </div>
      </div>
    </div>
  );
}
