# 🌸 Saheli

### Recognizing Women's Health Concerns Before They Are Overlooked

Saheli is a Women's Health Awareness Support System designed for ASHA workers and community health workers. It helps frontline healthcare workers record symptoms, identify recurring health concerns, generate awareness guidance, and encourage timely medical consultation.

The system is designed to support health awareness and referral decisions. It does **not diagnose diseases** and should not be used as a substitute for professional medical advice.

---

## 🌍 Sustainable Development Goals (SDGs)

### Primary SDG

* SDG 3: Good Health and Well-Being

### Secondary SDGs

* SDG 5: Gender Equality
* SDG 10: Reduced Inequalities

---

## 💡 Inspiration

Women's health concerns are often overlooked, normalized, or identified only after they become severe. In many communities, symptoms remain unreported for months due to limited awareness, social stigma, or restricted access to healthcare facilities.

This inspired the development of Saheli, a platform that supports community health workers in documenting symptoms systematically, identifying recurring health concerns, and encouraging timely medical consultation before conditions become more serious.

---

## 🎯 Problem Statement

Many women in rural and underserved communities experience symptoms related to reproductive health, pregnancy, nutrition, and general well-being. Due to limited health awareness, delayed reporting, and restricted access to healthcare facilities, these symptoms are often overlooked until they become severe.

Community health workers play a critical role in connecting women with healthcare services, but they may not always have structured digital tools to record symptoms, identify patterns, and prioritize referrals.

Saheli addresses this challenge by providing an easy-to-use awareness and referral support system for frontline healthcare workers.

---

## 🚀 Solution Overview

Saheli enables community health workers to:

* Register women in their communities
* Record symptoms during health visits
* Analyze symptom patterns using a rule-based awareness engine
* Generate awareness guidance
* Identify potentially high-risk cases
* Recommend timely medical consultation
* Track alerts and referrals
* View community-level health insights

The platform focuses on awareness, early intervention, and referral support rather than diagnosis.

---

## 🎯 Key Objectives

* Improve women's health awareness
* Support frontline community health workers
* Encourage timely medical consultation
* Enable structured symptom tracking
* Promote equitable healthcare access
* Provide transparent and explainable assessments

---

## 🛠️ Tech Stack

| Layer                  | Technology                  |
| ---------------------- | --------------------------- |
| Frontend               | Next.js 14                  |
| Language               | TypeScript                  |
| Styling                | Tailwind CSS                |
| Backend                | FastAPI                     |
| Database               | SQLite                      |
| ORM                    | SQLAlchemy                  |
| Data Validation        | Pydantic                    |
| AI Component           | Rule-Based Awareness Engine |
| AI Development Support | IBM BOB                     |
| Learning Framework     | IBM SkillsBuild             |

---

## 🏗️ Project Architecture

```text
Community Health Worker
            │
            ▼
      Saheli Frontend
        (Next.js)
            │
            ▼
      FastAPI Backend
            │
            ▼
   Awareness Engine
            │
            ▼
      SQLite Database
```

---

## 📁 Project Structure

```text
saheli/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── awareness_engine.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   └── lib/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── next.config.js
│
└── README.md
```

---

## ✨ Features

### 📊 Dashboard

* Community health overview
* High-risk assessment count
* Referral statistics
* Village-wise health insights
* Recent assessments summary

### 👩 Register Woman

* Name
* Age
* Village
* Contact information
* Pregnancy status
* Additional notes

### 🩺 Symptom Assessment

* Record symptoms across multiple health categories
* General health symptoms
* Menstrual health symptoms
* Pregnancy-related symptoms
* Postpartum concerns
* Nutrition-related symptoms

### 🧠 Awareness Analysis

* Low Risk Assessment
* Moderate Risk Assessment
* High Risk Assessment

Provides awareness guidance and referral recommendations based on recorded symptom patterns.

### 🔔 Alerts System

* Automatically generates alerts for high-risk assessments
* Tracks unresolved cases
* Supports follow-up actions
* Referral management workflow

### 📈 Reporting & Analytics

* Risk distribution charts
* Referral statistics
* Assessment trends
* Village-level insights
* Community health overview

---


## ⚙️ Installation

### Prerequisites

* Python 3.10+
* Node.js 18+
* npm

---

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

Backend runs at:

```text
http://localhost:8000
```

API Documentation:

```text
http://localhost:8000/docs
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| GET    | /                    | Health Check          |
| GET    | /dashboard           | Dashboard Summary     |
| GET    | /women               | List Women            |
| POST   | /women               | Register Woman        |
| GET    | /women/{id}          | Get Woman Details     |
| PUT    | /women/{id}          | Update Woman          |
| GET    | /symptoms/catalogue  | Symptom Catalogue     |
| POST   | /symptoms            | Log Symptoms          |
| GET    | /history             | Assessment History    |
| GET    | /history/{id}        | Individual Assessment |
| GET    | /report              | Awareness Report      |
| GET    | /alerts              | List Alerts           |
| PATCH  | /alerts/{id}/resolve | Resolve Alert         |

---

## 🤖 Responsible AI Considerations

* Saheli does not diagnose diseases.
* The system provides awareness guidance and referral recommendations only.
* Human judgment always takes priority over automated assessments.
* High-risk alerts should be reviewed by qualified healthcare professionals.
* Personal health information should be handled responsibly and securely.
* The platform is designed to support healthcare workers, not replace them.
* Assessment logic is transparent and explainable.

---

## 📈 Expected Impact

* Improved health awareness among women
* Earlier identification of potentially serious health concerns
* Better support for community health workers
* Increased referrals for timely medical consultation
* Improved healthcare access in underserved communities
* Better documentation of community health observations

---

## 🤝 Internship Context

This project was developed as part of the **1M1B AI for Sustainability Virtual Internship Program** in collaboration with **IBM SkillsBuild** and **AICTE**.

The project incorporates concepts explored during the internship, including responsible AI, AI-assisted decision support systems, sustainability-focused problem solving, community-centered technology design, and healthcare awareness workflows. IBM BOB was utilized during project ideation, solution refinement, and development planning.

---

## 🔮 Future Scope

* IBM Granite Integration
* Knowledge-Assisted Health Awareness Recommendations
* Multilingual Support
* Mobile Application
* Offline Synchronization
* Community Health Trend Analysis
* AI-Assisted Health Education Resources
* Enhanced Referral Intelligence

---

## 👩‍💻 Author

**Ritika Goud**

Developed as part of the 1M1B AI for Sustainability Virtual Internship Program.

---

## ⚠️ Disclaimer

Saheli is an awareness and referral support system only.

It does not diagnose diseases, prescribe treatments, or replace professional medical advice. Any high-risk assessment generated by the system should be reviewed by qualified healthcare professionals and followed up through the appropriate healthcare system.
