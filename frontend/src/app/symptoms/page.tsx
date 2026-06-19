"use client";

import { useEffect, useState } from "react";
import {
  getWomen,
  getSymptomCatalogue,
  logSymptoms,
  Assessment,
  Woman,
} from "@/lib/api";
import { ClipboardList, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

const RISK_CONFIG = {
  low: {
    icon: CheckCircle,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    title: "Low Risk",
    label: "badge-low",
  },
  moderate: {
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    title: "Moderate — Schedule a Check-up",
    label: "badge-moderate",
  },
  high: {
    icon: AlertTriangle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    title: "High — Referral Recommended",
    label: "badge-high",
  },
};

// Group symptoms by category for the UI
const CATEGORIES: Record<string, string[]> = {
  "General Health": ["fever", "headache", "fatigue", "dizziness", "nausea", "weight_loss", "breathlessness", "chest_pain", "vision_changes", "swelling"],
  "Menstrual Health": ["irregular_periods", "heavy_bleeding", "painful_periods", "missed_periods", "unusual_discharge"],
  "Pregnancy-related": ["reduced_fetal_movement", "vaginal_bleeding_pregnancy", "severe_abdominal_pain", "persistent_vomiting", "leaking_fluid"],
  "Postpartum": ["postpartum_bleeding", "breast_pain", "postpartum_fever", "sadness_postpartum"],
  "Nutrition": ["pale_skin", "brittle_nails", "mouth_sores"],
};

export default function SymptomsPage() {
  const [women, setWomen] = useState<Woman[]>([]);
  const [catalogue, setCatalogue] = useState<Record<string, string>>({});
  const [selectedWoman, setSelectedWoman] = useState<string>("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Assessment | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getWomen(), getSymptomCatalogue()])
      .then(([w, c]) => {
        setWomen(w);
        setCatalogue(c);
      })
      .catch(() => setError("Failed to load data. Ensure the backend is running."));
  }, []);

  function toggleSymptom(key: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWoman) { setError("Please select a woman."); return; }
    if (selectedSymptoms.length === 0) { setError("Please select at least one symptom."); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const assessment = await logSymptoms({
        woman_id: Number(selectedWoman),
        symptoms: selectedSymptoms,
        notes: notes || undefined,
      });
      setResult(assessment);
      setSelectedSymptoms([]);
      setNotes("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to log symptoms.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Log Symptoms</h1>
        <p className="page-subtitle">Select symptoms to generate an awareness assessment</p>
      </div>

      {error && (
        <div className="card bg-rose-50 border-rose-200">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="col-span-3 space-y-5">
          {/* Select Woman */}
          <div className="card">
            <label className="label">Select Woman *</label>
            <select
              className="input"
              value={selectedWoman}
              onChange={(e) => setSelectedWoman(e.target.value)}
              required
            >
              <option value="">— Choose a registered woman —</option>
              {women.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.village}, Age {w.age})
                  {w.pregnancy_status === "pregnant" ? " 🤰" : ""}
                </option>
              ))}
            </select>
            {women.length === 0 && (
              <p className="text-xs text-stone-400 mt-2">
                No women registered yet. <a href="/register" className="text-rose-600 hover:underline">Register one first.</a>
              </p>
            )}
          </div>

          {/* Symptoms by Category */}
          {Object.entries(CATEGORIES).map(([category, keys]) => (
            <div key={category} className="card">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {keys.map((key) => {
                  const label = catalogue[key] || key;
                  const selected = selectedSymptoms.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleSymptom(key)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-100 ${
                        selected
                          ? "bg-rose-600 border-rose-600 text-white"
                          : "bg-white border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div className="card">
            <label className="label">Notes (optional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Any additional observations or context…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading || selectedSymptoms.length === 0}
          >
            <ClipboardList size={16} />
            {loading ? "Assessing…" : `Submit Assessment (${selectedSymptoms.length} symptoms)`}
          </button>
        </form>

        {/* Result Panel */}
        <div className="col-span-2 space-y-4">
          {/* Selected symptoms list */}
          <div className="card">
            <h3 className="text-sm font-semibold text-stone-700 mb-2">
              Selected Symptoms ({selectedSymptoms.length})
            </h3>
            {selectedSymptoms.length === 0 ? (
              <p className="text-xs text-stone-400">None selected yet. Tap symptoms on the left.</p>
            ) : (
              <ul className="space-y-1">
                {selectedSymptoms.map((s) => (
                  <li key={s} className="text-xs text-stone-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                    {catalogue[s] || s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Assessment Result */}
          {result && (() => {
            const cfg = RISK_CONFIG[result.risk_level];
            const Icon = cfg.icon;
            return (
              <div className={`card ${cfg.bg} ${cfg.border}`}>
                <div className={`flex items-center gap-2 mb-3`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                  <span className={`font-bold ${cfg.color}`}>{cfg.title}</span>
                </div>

                {result.referral_needed && result.referral_reason && (
                  <div className="bg-white rounded-lg p-3 mb-3 border border-rose-200">
                    <p className="text-xs font-semibold text-rose-700 mb-0.5">Referral Needed</p>
                    <p className="text-xs text-rose-600">{result.referral_reason}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <Info size={12} /> Awareness Messages
                  </p>
                  <ul className="space-y-1.5">
                    {result.awareness_messages.map((msg, i) => (
                      <li key={i} className="text-xs text-stone-700 flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold mt-0.5">•</span>
                        {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
