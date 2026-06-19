"use client";

import { useState } from "react";
import { registerWoman, WomanCreate } from "@/lib/api";
import { CheckCircle, UserPlus } from "lucide-react";

const PREGNANCY_OPTIONS = [
  { value: "not_pregnant", label: "Not Pregnant" },
  { value: "pregnant", label: "Currently Pregnant" },
  { value: "postpartum", label: "Postpartum (after delivery)" },
];

const INITIAL: WomanCreate = {
  name: "",
  age: 18,
  village: "",
  contact: "",
  pregnancy_status: "not_pregnant",
  last_menstrual_period: "",
  num_children: 0,
};

export default function RegisterPage() {
  const [form, setForm] = useState<WomanCreate>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof WomanCreate, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const payload: WomanCreate = {
        ...form,
        age: Number(form.age),
        num_children: Number(form.num_children),
        last_menstrual_period: form.last_menstrual_period || undefined,
        contact: form.contact || undefined,
      };
      const w = await registerWoman(payload);
      setSuccess(`${w.name} has been registered successfully (ID: ${w.id}).`);
      setForm(INITIAL);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="page-title">Register Woman</h1>
        <p className="page-subtitle">Add a new community member to the Saheli program</p>
      </div>

      {success && (
        <div className="card bg-teal-50 border-teal-200 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-teal-800">Registered!</p>
            <p className="text-sm text-teal-700 mt-0.5">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="card bg-rose-50 border-rose-200">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Name */}
        <div>
          <label className="label">Full Name *</label>
          <input
            className="input"
            type="text"
            required
            placeholder="e.g. Meena Devi"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        {/* Age */}
        <div>
          <label className="label">Age *</label>
          <input
            className="input"
            type="number"
            required
            min={10}
            max={80}
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
          />
        </div>

        {/* Village */}
        <div>
          <label className="label">Village / Area *</label>
          <input
            className="input"
            type="text"
            required
            placeholder="e.g. Rampur"
            value={form.village}
            onChange={(e) => set("village", e.target.value)}
          />
        </div>

        {/* Contact */}
        <div>
          <label className="label">Mobile Number (optional)</label>
          <input
            className="input"
            type="tel"
            placeholder="10-digit mobile number"
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
          />
        </div>

        {/* Pregnancy Status */}
        <div>
          <label className="label">Pregnancy Status *</label>
          <select
            className="input"
            value={form.pregnancy_status}
            onChange={(e) => set("pregnancy_status", e.target.value)}
            required
          >
            {PREGNANCY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Last Menstrual Period */}
        <div>
          <label className="label">Last Menstrual Period (optional)</label>
          <input
            className="input"
            type="date"
            value={form.last_menstrual_period as string}
            onChange={(e) => set("last_menstrual_period", e.target.value)}
          />
        </div>

        {/* Number of Children */}
        <div>
          <label className="label">Number of Children</label>
          <input
            className="input"
            type="number"
            min={0}
            value={form.num_children}
            onChange={(e) => set("num_children", e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          <UserPlus size={16} />
          {loading ? "Registering…" : "Register Woman"}
        </button>
      </form>
    </div>
  );
}
