"""
awareness_engine.py
────────────────────
Awareness & referral support engine for Saheli.
No diagnosis is made. Only awareness messages and referral flags are produced.
"""

from typing import List, Tuple, Optional

# ── Symptom Catalogue ──────────────────────────────────────────
SYMPTOMS = {
    # General
    "fever": "Fever (high body temperature)",
    "headache": "Severe headache",
    "fatigue": "Unusual tiredness / fatigue",
    "dizziness": "Dizziness or fainting",
    "nausea": "Nausea / vomiting",
    "weight_loss": "Unexplained weight loss",
    "swelling": "Swelling of hands, face or feet",
    "breathlessness": "Difficulty breathing",
    "chest_pain": "Chest pain or tightness",
    "vision_changes": "Blurred or changed vision",

    # Menstrual
    "irregular_periods": "Irregular menstrual cycles",
    "heavy_bleeding": "Very heavy menstrual bleeding",
    "painful_periods": "Severe pain during periods",
    "missed_periods": "Missed period(s)",
    "unusual_discharge": "Unusual vaginal discharge",

    # Pregnancy-specific
    "reduced_fetal_movement": "Reduced baby movement",
    "vaginal_bleeding_pregnancy": "Bleeding during pregnancy",
    "severe_abdominal_pain": "Severe abdominal pain",
    "persistent_vomiting": "Persistent vomiting during pregnancy",
    "leaking_fluid": "Leaking of fluid from vagina",

    # Postpartum
    "postpartum_bleeding": "Excessive bleeding after delivery",
    "breast_pain": "Breast pain or redness",
    "postpartum_fever": "Fever after delivery",
    "sadness_postpartum": "Persistent sadness / low mood after delivery",

    # Nutrition
    "pale_skin": "Pale skin / white inner eyelids",
    "brittle_nails": "Brittle nails or hair loss",
    "mouth_sores": "Mouth sores or cracked lips",
}


# ── Risk Rules ─────────────────────────────────────────────────
# Each rule: (symptom_set, risk_level, awareness_messages, referral_needed, referral_reason)

RULES: List[Tuple] = [
    # ── HIGH RISK ──────────────────────────────────────────────
    (
        {"vaginal_bleeding_pregnancy"},
        "high",
        [
            "Bleeding during pregnancy is a serious sign that needs immediate attention.",
            "Please refer this woman to the nearest PHC or hospital without delay.",
            "Keep the woman calm, lying on her side, and avoid giving any medicines.",
        ],
        True,
        "Vaginal bleeding during pregnancy — immediate referral required.",
    ),
    (
        {"reduced_fetal_movement"},
        "high",
        [
            "Reduced baby movement can signal that the baby needs help.",
            "Count kicks: fewer than 10 kicks in 2 hours is a warning sign.",
            "Refer the woman to the nearest health facility immediately.",
        ],
        True,
        "Reduced fetal movement — urgent evaluation needed.",
    ),
    (
        {"leaking_fluid"},
        "high",
        [
            "Leaking of fluid before the due date may mean the water has broken early.",
            "This requires same-day referral to a hospital.",
            "Ask the woman to avoid inserting anything and to keep the area clean.",
        ],
        True,
        "Possible premature rupture of membranes — same-day referral.",
    ),
    (
        {"severe_abdominal_pain"},
        "high",
        [
            "Severe abdominal pain during pregnancy or postpartum needs urgent medical attention.",
            "Do not give pain-killers without medical advice.",
            "Refer to the nearest PHC or hospital immediately.",
        ],
        True,
        "Severe abdominal pain — urgent referral needed.",
    ),
    (
        {"postpartum_bleeding"},
        "high",
        [
            "Excessive bleeding after delivery (soaking more than one pad per hour) is an emergency.",
            "Keep the woman lying down and refer her to a hospital immediately.",
            "Do not delay — postpartum hemorrhage is life-threatening.",
        ],
        True,
        "Postpartum hemorrhage risk — immediate referral.",
    ),
    (
        {"swelling", "headache", "vision_changes"},
        "high",
        [
            "Swelling with severe headache and vision changes during pregnancy may indicate pre-eclampsia.",
            "This is a serious condition requiring immediate medical care.",
            "Refer to PHC or hospital without delay.",
        ],
        True,
        "Possible pre-eclampsia signs — urgent referral.",
    ),
    (
        {"chest_pain", "breathlessness"},
        "high",
        [
            "Chest pain with difficulty breathing requires urgent evaluation.",
            "Do not allow the woman to exert herself.",
            "Refer to the nearest facility immediately.",
        ],
        True,
        "Chest pain with breathlessness — urgent referral.",
    ),

    # ── MODERATE RISK ──────────────────────────────────────────
    (
        {"swelling"},
        "moderate",
        [
            "Swelling of feet, face or hands during pregnancy should be reported to a health worker.",
            "Advise the woman to rest with her feet elevated.",
            "Reduce salt in food. If swelling is in the face or does not go away, visit the PHC.",
            "Schedule a check-up within the next 2–3 days.",
        ],
        False,
        None,
    ),
    (
        {"persistent_vomiting"},
        "moderate",
        [
            "Persistent vomiting can cause dehydration and weakness.",
            "Encourage small, frequent meals. Ginger tea or lemon may help mild nausea.",
            "If vomiting prevents eating or drinking for more than 24 hours, refer to PHC.",
        ],
        False,
        None,
    ),
    (
        {"postpartum_fever"},
        "moderate",
        [
            "Fever after delivery can be a sign of infection and should not be ignored.",
            "Keep the woman hydrated and refer to the PHC for evaluation within 24 hours.",
            "Check for signs of breast infection (redness, hardness) or wound infection.",
        ],
        True,
        "Postpartum fever — evaluation within 24 hours.",
    ),
    (
        {"heavy_bleeding"},
        "moderate",
        [
            "Very heavy menstrual bleeding (soaking more than one pad every 2 hours) can cause anaemia.",
            "Encourage iron-rich foods: green leafy vegetables, lentils, jaggery, liver.",
            "Refer to PHC for further evaluation if bleeding has been heavy for more than 3 cycles.",
        ],
        False,
        None,
    ),
    (
        {"sadness_postpartum"},
        "moderate",
        [
            "Feeling very sad or low after childbirth is common and is called postpartum depression.",
            "The woman is not alone — this is a health condition, not a personal failing.",
            "Encourage family support, rest, and proper nutrition.",
            "Refer to the ANM or PHC counsellor if the sadness lasts more than two weeks.",
        ],
        False,
        None,
    ),
    (
        {"unusual_discharge"},
        "moderate",
        [
            "Unusual or foul-smelling vaginal discharge may indicate an infection.",
            "Advise the woman to keep the area clean and dry.",
            "Refer to the PHC for evaluation — do not encourage self-medication.",
        ],
        True,
        "Possible vaginal infection — PHC evaluation recommended.",
    ),
    (
        {"breast_pain"},
        "moderate",
        [
            "Breast pain with redness or hardness after delivery can indicate mastitis (breast infection).",
            "Encourage continued breastfeeding from the affected side if possible.",
            "Apply warm compresses. Refer to ANM or PHC if pain worsens or fever develops.",
        ],
        False,
        None,
    ),

    # ── LOW RISK / AWARENESS ───────────────────────────────────
    (
        {"pale_skin"},
        "low",
        [
            "Pale skin or white inner eyelids may be a sign of anaemia (low blood).",
            "Encourage iron-rich foods: green leafy vegetables, lentils, jaggery, amla.",
            "Iron and folic acid tablets should be taken as prescribed.",
            "Avoid tea or coffee immediately after meals as they reduce iron absorption.",
        ],
        False,
        None,
    ),
    (
        {"irregular_periods"},
        "low",
        [
            "Irregular periods can be caused by stress, poor nutrition, or hormonal changes.",
            "Encourage regular meals, adequate sleep, and light physical activity.",
            "If periods have been irregular for more than 3 months, visit the PHC.",
        ],
        False,
        None,
    ),
    (
        {"missed_periods"},
        "low",
        [
            "A missed period may indicate pregnancy. Encourage the woman to do a pregnancy test.",
            "Early prenatal care is very important for the health of mother and baby.",
            "Register with the ANM as soon as pregnancy is confirmed.",
        ],
        False,
        None,
    ),
    (
        {"nausea"},
        "low",
        [
            "Mild nausea is common in early pregnancy.",
            "Encourage small, frequent meals. Dry biscuits or plain rice can help.",
            "Stay hydrated. Avoid spicy or fatty foods.",
        ],
        False,
        None,
    ),
    (
        {"fatigue"},
        "low",
        [
            "Unusual tiredness can be linked to anaemia, poor nutrition, or overwork.",
            "Encourage adequate rest, a balanced diet, and iron supplementation.",
            "If fatigue is severe and persistent, a health check-up is recommended.",
        ],
        False,
        None,
    ),
    (
        {"dizziness"},
        "low",
        [
            "Dizziness can result from low blood pressure, anaemia, or dehydration.",
            "Advise the woman to stand up slowly, drink plenty of water, and eat regularly.",
            "If dizziness is frequent or causes fainting, refer to the PHC.",
        ],
        False,
        None,
    ),
    (
        {"mouth_sores", "brittle_nails"},
        "low",
        [
            "Mouth sores and brittle nails can be signs of nutritional deficiency.",
            "Encourage a varied diet with fruits, vegetables, eggs, and dairy.",
            "Vitamin supplements may be recommended by the ANM.",
        ],
        False,
        None,
    ),
    (
        {"weight_loss"},
        "low",
        [
            "Unexplained weight loss should be discussed with a health worker.",
            "Encourage calorie-rich foods and regular meals.",
            "Refer to the PHC if weight loss continues for more than a month.",
        ],
        False,
        None,
    ),
    (
        {"fever"},
        "low",
        [
            "Fever should not be ignored, especially during pregnancy or postpartum.",
            "Keep the woman hydrated. Use a wet cloth on the forehead for comfort.",
            "If fever is above 38°C or lasts more than 2 days, refer to the PHC.",
        ],
        False,
        None,
    ),
    (
        {"painful_periods"},
        "low",
        [
            "Painful periods can be managed with rest and a hot water bottle on the abdomen.",
            "Avoid heavy work during the first two days of the period.",
            "If pain is severe and interferes with daily activities, visit the PHC.",
        ],
        False,
        None,
    ),
]

# Risk ordering for comparison
RISK_ORDER = {"low": 1, "moderate": 2, "high": 3}


def analyse_symptoms(
    symptoms: List[str],
    pregnancy_status: str = "not_pregnant",
) -> dict:
    """
    Given a list of symptom keys and pregnancy status,
    return risk_level, awareness_messages, referral_needed, referral_reason.
    No diagnosis is produced.
    """
    symptoms_set = set(symptoms)
    matched_risk = "low"
    all_messages: List[str] = []
    referral_needed = False
    referral_reasons: List[str] = []

    for rule_symptoms, risk, messages, ref_needed, ref_reason in RULES:
        if rule_symptoms & symptoms_set:  # any symptom in rule matches
            # Escalate risk if this rule is higher
            if RISK_ORDER[risk] > RISK_ORDER[matched_risk]:
                matched_risk = risk
            all_messages.extend(messages)
            if ref_needed:
                referral_needed = True
            if ref_reason:
                referral_reasons.append(ref_reason)

    # De-duplicate messages while preserving order
    seen = set()
    unique_messages: List[str] = []
    for m in all_messages:
        if m not in seen:
            seen.add(m)
            unique_messages.append(m)

    # If no rules matched, give a general wellness message
    if not unique_messages:
        unique_messages = [
            "No specific concerns were flagged for the reported symptoms.",
            "Continue regular check-ups with the ANM.",
            "Encourage balanced nutrition, clean water, and adequate rest.",
        ]

    # Always add general nutrition reminder for pregnant women
    if pregnancy_status == "pregnant" and "balanced nutrition" not in " ".join(unique_messages):
        unique_messages.append(
            "Reminder: Regular ante-natal check-ups, iron-folic acid tablets, and TT vaccination are essential during pregnancy."
        )

    return {
        "risk_level": matched_risk,
        "awareness_messages": unique_messages,
        "referral_needed": referral_needed,
        "referral_reason": "; ".join(referral_reasons) if referral_reasons else None,
    }


def get_all_symptoms() -> dict:
    """Return the full symptom catalogue."""
    return SYMPTOMS


def generate_awareness_report(assessments: list) -> dict:
    """
    Aggregate assessment data into a summary report for the ASHA worker.
    """
    total = len(assessments)
    risk_counts = {"low": 0, "moderate": 0, "high": 0}
    referral_count = 0
    village_risk: dict = {}

    for a in assessments:
        risk = a.risk_level
        risk_counts[risk] = risk_counts.get(risk, 0) + 1
        if a.referral_needed:
            referral_count += 1

    return {
        "total_assessments": total,
        "risk_breakdown": risk_counts,
        "referral_count": referral_count,
    }
