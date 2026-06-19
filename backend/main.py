"""
main.py — Saheli FastAPI Backend
Run with: uvicorn main:app --reload --port 8000
"""

import json
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import engine, get_db
from awareness_engine import analyse_symptoms, get_all_symptoms, generate_awareness_report

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Saheli API",
    description="Women's Health Awareness Support System for ASHA Workers",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Utility ────────────────────────────────────────────────────

def _assessment_to_out(a: models.Assessment) -> schemas.AssessmentOut:
    return schemas.AssessmentOut(
        id=a.id,
        woman_id=a.woman_id,
        symptom_log_id=a.symptom_log_id,
        assessed_on=a.assessed_on,
        risk_level=a.risk_level,
        awareness_messages=json.loads(a.awareness_messages),
        referral_needed=a.referral_needed,
        referral_reason=a.referral_reason,
        woman_name=a.woman.name if a.woman else None,
        woman_village=a.woman.village if a.woman else None,
    )


def _alert_to_out(al: models.Alert, db: Session) -> schemas.AlertOut:
    woman = db.query(models.Woman).filter(models.Woman.id == al.woman_id).first()
    return schemas.AlertOut(
        id=al.id,
        woman_id=al.woman_id,
        created_on=al.created_on,
        alert_type=al.alert_type,
        message=al.message,
        is_resolved=al.is_resolved,
        resolved_on=al.resolved_on,
        woman_name=woman.name if woman else None,
        woman_village=woman.village if woman else None,
    )


# ── Dashboard ──────────────────────────────────────────────────

@app.get("/dashboard", response_model=schemas.DashboardSummary)
def get_dashboard(db: Session = Depends(get_db)):
    total_women = db.query(models.Woman).filter(models.Woman.is_active == True).count()
    pregnant_women = (
        db.query(models.Woman)
        .filter(models.Woman.pregnancy_status == "pregnant", models.Woman.is_active == True)
        .count()
    )
    high_risk = (
        db.query(models.Assessment)
        .filter(models.Assessment.risk_level == "high")
        .count()
    )
    unresolved_alerts = (
        db.query(models.Alert).filter(models.Alert.is_resolved == False).count()
    )
    recent = (
        db.query(models.Assessment)
        .order_by(models.Assessment.assessed_on.desc())
        .limit(5)
        .all()
    )

    # Village breakdown
    rows = (
        db.query(models.Woman.village, func.count(models.Woman.id).label("count"))
        .filter(models.Woman.is_active == True)
        .group_by(models.Woman.village)
        .all()
    )
    village_breakdown = [{"village": r.village, "count": r.count} for r in rows]

    return schemas.DashboardSummary(
        total_women=total_women,
        pregnant_women=pregnant_women,
        high_risk_count=high_risk,
        unresolved_alerts=unresolved_alerts,
        recent_assessments=[_assessment_to_out(a) for a in recent],
        village_breakdown=village_breakdown,
    )


# ── Women ──────────────────────────────────────────────────────

@app.get("/women", response_model=List[schemas.WomanOut])
def list_women(
    village: Optional[str] = Query(None),
    pregnancy_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Woman).filter(models.Woman.is_active == True)
    if village:
        q = q.filter(models.Woman.village.ilike(f"%{village}%"))
    if pregnancy_status:
        q = q.filter(models.Woman.pregnancy_status == pregnancy_status)
    return q.order_by(models.Woman.registered_on.desc()).all()


@app.post("/women", response_model=schemas.WomanOut, status_code=201)
def register_woman(payload: schemas.WomanCreate, db: Session = Depends(get_db)):
    woman = models.Woman(**payload.model_dump())
    db.add(woman)
    db.commit()
    db.refresh(woman)
    return woman


@app.get("/women/{woman_id}", response_model=schemas.WomanOut)
def get_woman(woman_id: int, db: Session = Depends(get_db)):
    woman = db.query(models.Woman).filter(models.Woman.id == woman_id).first()
    if not woman:
        raise HTTPException(status_code=404, detail="Woman not found")
    return woman


@app.put("/women/{woman_id}", response_model=schemas.WomanOut)
def update_woman(woman_id: int, payload: schemas.WomanUpdate, db: Session = Depends(get_db)):
    woman = db.query(models.Woman).filter(models.Woman.id == woman_id).first()
    if not woman:
        raise HTTPException(status_code=404, detail="Woman not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(woman, field, value)
    db.commit()
    db.refresh(woman)
    return woman


# ── Symptoms ───────────────────────────────────────────────────

@app.get("/symptoms/catalogue")
def symptom_catalogue():
    return get_all_symptoms()


@app.post("/symptoms", response_model=schemas.AssessmentOut, status_code=201)
def log_symptoms(payload: schemas.SymptomLogCreate, db: Session = Depends(get_db)):
    woman = db.query(models.Woman).filter(models.Woman.id == payload.woman_id).first()
    if not woman:
        raise HTTPException(status_code=404, detail="Woman not found")

    # Save symptom log
    log = models.SymptomLog(
        woman_id=payload.woman_id,
        symptoms=json.dumps(payload.symptoms),
        notes=payload.notes,
    )
    db.add(log)
    db.flush()

    # Run awareness engine
    result = analyse_symptoms(payload.symptoms, woman.pregnancy_status)

    # Save assessment
    assessment = models.Assessment(
        woman_id=payload.woman_id,
        symptom_log_id=log.id,
        risk_level=result["risk_level"],
        awareness_messages=json.dumps(result["awareness_messages"]),
        referral_needed=result["referral_needed"],
        referral_reason=result["referral_reason"],
    )
    db.add(assessment)

    # Create alert if high risk
    if result["risk_level"] == "high":
        alert = models.Alert(
            woman_id=payload.woman_id,
            alert_type="high_risk",
            message=f"High-risk assessment for {woman.name} ({woman.village}). {result['referral_reason'] or ''}",
        )
        db.add(alert)
    elif result["referral_needed"]:
        alert = models.Alert(
            woman_id=payload.woman_id,
            alert_type="referral",
            message=f"Referral recommended for {woman.name} ({woman.village}). {result['referral_reason'] or ''}",
        )
        db.add(alert)

    db.commit()
    db.refresh(assessment)
    return _assessment_to_out(assessment)


# ── Assessment History ─────────────────────────────────────────

@app.get("/history", response_model=List[schemas.AssessmentOut])
def assessment_history(
    woman_id: Optional[int] = Query(None),
    risk_level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Assessment)
    if woman_id:
        q = q.filter(models.Assessment.woman_id == woman_id)
    if risk_level:
        q = q.filter(models.Assessment.risk_level == risk_level)
    assessments = q.order_by(models.Assessment.assessed_on.desc()).limit(100).all()
    return [_assessment_to_out(a) for a in assessments]


@app.get("/history/{assessment_id}", response_model=schemas.AssessmentOut)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    a = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return _assessment_to_out(a)


# ── Awareness Report ───────────────────────────────────────────

@app.get("/report")
def awareness_report(db: Session = Depends(get_db)):
    assessments = db.query(models.Assessment).all()
    summary = generate_awareness_report(assessments)

    # Women per village
    village_rows = (
        db.query(models.Woman.village, func.count(models.Woman.id).label("count"))
        .filter(models.Woman.is_active == True)
        .group_by(models.Woman.village)
        .all()
    )

    # Monthly assessments (last 6 months)
    monthly = (
        db.query(
            func.strftime("%Y-%m", models.Assessment.assessed_on).label("month"),
            func.count(models.Assessment.id).label("count"),
        )
        .group_by("month")
        .order_by("month")
        .limit(6)
        .all()
    )

    return {
        **summary,
        "village_stats": [{"village": r.village, "count": r.count} for r in village_rows],
        "monthly_assessments": [{"month": r.month, "count": r.count} for r in monthly],
    }


# ── Alerts ─────────────────────────────────────────────────────

@app.get("/alerts", response_model=List[schemas.AlertOut])
def list_alerts(
    resolved: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Alert)
    if resolved is not None:
        q = q.filter(models.Alert.is_resolved == resolved)
    alerts = q.order_by(models.Alert.created_on.desc()).all()
    return [_alert_to_out(al, db) for al in alerts]


@app.patch("/alerts/{alert_id}/resolve", response_model=schemas.AlertOut)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    alert.resolved_on = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return _alert_to_out(alert, db)


# ── Health Check ───────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "app": "Saheli API", "version": "1.0.0"}
