"use client";

import { useEffect, useState } from "react";
import { getReport, AwarenessReport } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FileBarChart, TrendingUp, Users, MapPin, ArrowRightCircle } from "lucide-react";

const RISK_COLORS = {
  low: "#14b8a6",
  moderate: "#f59e0b",
  high: "#e11d48",
};

export default function ReportPage() {
  const [report, setReport] = useState<AwarenessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getReport()
      .then(setReport)
      .catch(() => setError("Failed to load report."))
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
      <div className="card bg-rose-50 border-rose-200 mt-4">
        <p className="text-sm text-rose-700">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  const pieData = [
    { name: "Low Risk", value: report.risk_breakdown.low, color: RISK_COLORS.low },
    { name: "Moderate", value: report.risk_breakdown.moderate, color: RISK_COLORS.moderate },
    { name: "High Risk", value: report.risk_breakdown.high, color: RISK_COLORS.high },
  ].filter((d) => d.value > 0);

  const monthlyData = report.monthly_assessments.map((m) => ({
    month: m.month,
    Assessments: m.count,
  }));

  const villageData = report.village_stats.map((v) => ({
    village: v.village,
    Women: v.count,
  }));

  const referralRate =
    report.total_assessments > 0
      ? Math.round((report.referral_count / report.total_assessments) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Awareness Report</h1>
        <p className="page-subtitle">Program overview for ASHA worker review</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-800">{report.total_assessments}</p>
            <p className="text-xs text-stone-500">Total Assessments</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
            <ArrowRightCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-800">{report.referral_count}</p>
            <p className="text-xs text-stone-500">Referrals Recommended ({referralRate}%)</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-800">{report.risk_breakdown.high}</p>
            <p className="text-xs text-stone-500">High Risk Cases</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Risk Breakdown Pie */}
        <div className="card">
          <h2 className="font-semibold text-stone-800 mb-4 text-sm">Risk Level Breakdown</h2>
          {pieData.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">No assessments yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} assessments`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <h2 className="font-semibold text-stone-800 mb-4 text-sm">Monthly Assessments</h2>
          {monthlyData.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Assessments" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Village Stats */}
      <div className="card">
        <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-rose-500" />
          Women Registered by Village
        </h2>
        {villageData.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-6">No registrations yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={villageData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="village" type="category" tick={{ fontSize: 11 }} width={60} />
              <Tooltip />
              <Bar dataKey="Women" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Disclaimer */}
      <div className="card bg-stone-50 border-stone-200">
        <p className="text-xs text-stone-500 leading-relaxed">
          <strong>Note:</strong> This report is for community health awareness purposes only. It is not a medical diagnostic tool. All high-risk cases and referrals should be followed up with the nearest PHC, sub-centre, or district hospital. Data shown reflects inputs recorded in this Saheli instance.
        </p>
      </div>
    </div>
  );
}
