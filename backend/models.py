from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Woman(Base):
    __tablename__ = "women"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    village = Column(String(100), nullable=False)
    contact = Column(String(15), nullable=True)
    pregnancy_status = Column(String(20), nullable=False, default="not_pregnant")
    # not_pregnant, pregnant, postpartum
    last_menstrual_period = Column(Date, nullable=True)
    num_children = Column(Integer, default=0)
    registered_on = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    symptom_logs = relationship("SymptomLog", back_populates="woman")
    assessments = relationship("Assessment", back_populates="woman")


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id = Column(Integer, primary_key=True, index=True)
    woman_id = Column(Integer, ForeignKey("women.id"), nullable=False)
    logged_on = Column(DateTime(timezone=True), server_default=func.now())
    symptoms = Column(Text, nullable=False)  # JSON list of symptom keys
    notes = Column(Text, nullable=True)

    woman = relationship("Woman", back_populates="symptom_logs")
    assessment = relationship("Assessment", back_populates="symptom_log", uselist=False)


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    woman_id = Column(Integer, ForeignKey("women.id"), nullable=False)
    symptom_log_id = Column(Integer, ForeignKey("symptom_logs.id"), nullable=True)
    assessed_on = Column(DateTime(timezone=True), server_default=func.now())
    risk_level = Column(String(20), nullable=False)  # low, moderate, high
    awareness_messages = Column(Text, nullable=False)  # JSON list of messages
    referral_needed = Column(Boolean, default=False)
    referral_reason = Column(Text, nullable=True)

    woman = relationship("Woman", back_populates="assessments")
    symptom_log = relationship("SymptomLog", back_populates="assessment")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    woman_id = Column(Integer, ForeignKey("women.id"), nullable=False)
    created_on = Column(DateTime(timezone=True), server_default=func.now())
    alert_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    resolved_on = Column(DateTime(timezone=True), nullable=True)
