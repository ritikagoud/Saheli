from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


# ── Woman Schemas ──────────────────────────────────────────────

class WomanBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=10, le=80)
    village: str = Field(..., min_length=2, max_length=100)
    contact: Optional[str] = None
    pregnancy_status: str = Field(default="not_pregnant")
    last_menstrual_period: Optional[date] = None
    num_children: int = Field(default=0, ge=0)


class WomanCreate(WomanBase):
    pass


class WomanUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    village: Optional[str] = None
    contact: Optional[str] = None
    pregnancy_status: Optional[str] = None
    last_menstrual_period: Optional[date] = None
    num_children: Optional[int] = None
    is_active: Optional[bool] = None


class WomanOut(WomanBase):
    id: int
    registered_on: datetime
    is_active: bool

    class Config:
        from_attributes = True


# ── Symptom Log Schemas ────────────────────────────────────────

class SymptomLogCreate(BaseModel):
    woman_id: int
    symptoms: List[str]
    notes: Optional[str] = None


class SymptomLogOut(BaseModel):
    id: int
    woman_id: int
    logged_on: datetime
    symptoms: List[str]
    notes: Optional[str]

    class Config:
        from_attributes = True


# ── Assessment Schemas ─────────────────────────────────────────

class AssessmentOut(BaseModel):
    id: int
    woman_id: int
    symptom_log_id: Optional[int]
    assessed_on: datetime
    risk_level: str
    awareness_messages: List[str]
    referral_needed: bool
    referral_reason: Optional[str]
    woman_name: Optional[str] = None
    woman_village: Optional[str] = None

    class Config:
        from_attributes = True


# ── Alert Schemas ──────────────────────────────────────────────

class AlertOut(BaseModel):
    id: int
    woman_id: int
    created_on: datetime
    alert_type: str
    message: str
    is_resolved: bool
    resolved_on: Optional[datetime]
    woman_name: Optional[str] = None
    woman_village: Optional[str] = None

    class Config:
        from_attributes = True


# ── Dashboard Summary ──────────────────────────────────────────

class DashboardSummary(BaseModel):
    total_women: int
    pregnant_women: int
    high_risk_count: int
    unresolved_alerts: int
    recent_assessments: List[AssessmentOut]
    village_breakdown: List[dict]
