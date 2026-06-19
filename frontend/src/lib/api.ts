const BASE = "http://localhost:8000";

export interface Woman {
  id: number;
  name: string;
  age: number;
  village: string;
  contact?: string;
  pregnancy_status: string;
  last_menstrual_period?: string;
  num_children: number;
  registered_on: string;
  is_active: boolean;
}

export interface WomanCreate {
  name: string;
  age: number;
  village: string;
  contact?: string;
  pregnancy_status: string;
  last_menstrual_period?: string;
  num_children: number;
}

export interface Assessment {
  id: number;
  woman_id: number;
  symptom_log_id?: number;
  assessed_on: string;
  risk_level: "low" | "moderate" | "high";
  awareness_messages: string[];
  referral_needed: boolean;
  referral_reason?: string;
  woman_name?: string;
  woman_village?: string;
}

export interface Alert {
  id: number;
  woman_id: number;
  created_on: string;
  alert_type: string;
  message: string;
  is_resolved: boolean;
  resolved_on?: string;
  woman_name?: string;
  woman_village?: string;
}

export interface DashboardSummary {
  total_women: number;
  pregnant_women: number;
  high_risk_count: number;
  unresolved_alerts: number;
  recent_assessments: Assessment[];
  village_breakdown: { village: string; count: number }[];
}

export interface AwarenessReport {
  total_assessments: number;
  risk_breakdown: { low: number; moderate: number; high: number };
  referral_count: number;
  village_stats: { village: string; count: number }[];
  monthly_assessments: { month: string; count: number }[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Dashboard ──────────────────────────────────────────────────
export const getDashboard = () => request<DashboardSummary>("/dashboard");

// ── Women ──────────────────────────────────────────────────────
export const getWomen = (village?: string, pregnancy_status?: string) => {
  const params = new URLSearchParams();
  if (village) params.set("village", village);
  if (pregnancy_status) params.set("pregnancy_status", pregnancy_status);
  const qs = params.toString();
  return request<Woman[]>(`/women${qs ? `?${qs}` : ""}`);
};

export const getWoman = (id: number) => request<Woman>(`/women/${id}`);

export const registerWoman = (data: WomanCreate) =>
  request<Woman>("/women", { method: "POST", body: JSON.stringify(data) });

// ── Symptoms ───────────────────────────────────────────────────
export const getSymptomCatalogue = () =>
  request<Record<string, string>>("/symptoms/catalogue");

export const logSymptoms = (data: {
  woman_id: number;
  symptoms: string[];
  notes?: string;
}) => request<Assessment>("/symptoms", { method: "POST", body: JSON.stringify(data) });

// ── History ────────────────────────────────────────────────────
export const getHistory = (woman_id?: number, risk_level?: string) => {
  const params = new URLSearchParams();
  if (woman_id) params.set("woman_id", String(woman_id));
  if (risk_level) params.set("risk_level", risk_level);
  const qs = params.toString();
  return request<Assessment[]>(`/history${qs ? `?${qs}` : ""}`);
};

// ── Report ─────────────────────────────────────────────────────
export const getReport = () => request<AwarenessReport>("/report");

// ── Alerts ─────────────────────────────────────────────────────
export const getAlerts = (resolved?: boolean) => {
  const params = new URLSearchParams();
  if (resolved !== undefined) params.set("resolved", String(resolved));
  const qs = params.toString();
  return request<Alert[]>(`/alerts${qs ? `?${qs}` : ""}`);
};

export const resolveAlert = (id: number) =>
  request<Alert>(`/alerts/${id}/resolve`, { method: "PATCH" });
