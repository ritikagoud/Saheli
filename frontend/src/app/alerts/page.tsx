"use client";

import { useEffect, useState } from "react";
import { getAlerts, resolveAlert, Alert } from "@/lib/api";
import { Bell, CheckCircle, AlertTriangle, ArrowRightCircle, Filter } from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  high_risk: { label: "High Risk", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
  referral: { label: "Referral", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
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

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [resolving, setResolving] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const resolved =
        filter === "unresolved" ? false : filter === "resolved" ? true : undefined;
      const data = await getAlerts(resolved);
      setAlerts(data);
    } catch {
      setError("Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleResolve(id: number) {
    setResolving(id);
    try {
      await resolveAlert(id);
      await load();
    } catch {
      setError("Failed to resolve alert.");
    } finally {
      setResolving(null);
    }
  }

  const unresolved = alerts.filter((a) => !a.is_resolved);
  const resolved = alerts.filter((a) => a.is_resolved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Alerts</h1>
          <p className="page-subtitle">High-risk and referral alerts across the program</p>
        </div>
        {unresolved.length > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
            <Bell className="w-4 h-4 text-rose-600" />
            <span className="text-sm font-semibold text-rose-700">{unresolved.length} unresolved</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["unresolved", "all", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              filter === f
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-white text-stone-500 border-stone-200 hover:border-rose-300"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
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
      ) : alerts.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="w-10 h-10 text-teal-400 mx-auto mb-3" />
          <p className="text-stone-500 text-sm font-medium">
            {filter === "unresolved" ? "No unresolved alerts. Great work!" : "No alerts found."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const cfg = TYPE_CONFIG[alert.alert_type] || TYPE_CONFIG.referral;
            return (
              <div
                key={alert.id}
                className={`card ${cfg.bg} ${cfg.border} ${alert.is_resolved ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {alert.alert_type === "high_risk" ? (
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      ) : (
                        <ArrowRightCircle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        {alert.is_resolved && (
                          <span className="text-xs text-teal-600 font-medium">✓ Resolved</span>
                        )}
                      </div>
                      <p className="font-semibold text-stone-800 text-sm">{alert.woman_name || `Woman #${alert.woman_id}`}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{alert.woman_village} · {fmt(alert.created_on)}</p>
                      <p className="text-sm text-stone-700 mt-2 leading-relaxed">{alert.message}</p>
                      {alert.resolved_on && (
                        <p className="text-xs text-teal-600 mt-1.5">Resolved on {fmt(alert.resolved_on)}</p>
                      )}
                    </div>
                  </div>

                  {!alert.is_resolved && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolving === alert.id}
                      className="btn-teal text-xs px-3 py-1.5 flex-shrink-0 flex items-center gap-1.5"
                    >
                      <CheckCircle size={13} />
                      {resolving === alert.id ? "Marking…" : "Mark Resolved"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
