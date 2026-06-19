# 🌸 Saheli — Women's Health Awareness Support System

Saheli is a beginner-friendly, offline-first web application for **ASHA workers and community health workers** to register women, log symptoms, receive awareness guidance, and track referral alerts — all without an internet connection.

> **Important:** Saheli is an **awareness and referral support tool only**. It does not diagnose any condition. All high-risk alerts should be followed up with the nearest PHC or hospital.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS |
| Backend | FastAPI · Python |
| Database | SQLite (file-based, no server needed) |
| ORM | SQLAlchemy |

---

## Project Structure

```
saheli/
├── backend/
│   ├── main.py             # FastAPI app & all API routes
│   ├── database.py         # SQLite connection & session
│   ├── models.py           # SQLAlchemy ORM models
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── awareness_engine.py # Symptom analysis & awareness logic
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout with sidebar nav
│   │   │   ├── globals.css         # Global styles
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── register/page.tsx   # Register a woman
│   │   │   ├── symptoms/page.tsx   # Log symptoms & get assessment
│   │   │   ├── history/page.tsx    # Assessment history
│   │   │   ├── report/page.tsx     # Awareness report with charts
│   │   │   └── alerts/page.tsx     # Alerts management
│   │   └── lib/
│   │       └── api.ts              # All API calls to backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── next.config.js
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm (comes with Node.js)

---

### Step 1 — Start the Backend

Open a terminal and navigate to the `backend` folder:

```bash
cd saheli/backend
```

Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

The SQLite database (`saheli.db`) is created automatically in the `backend/` folder on first run.

---

### Step 2 — Start the Frontend

Open a **second terminal** and navigate to the `frontend` folder:

```bash
cd saheli/frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

---

## Features

### 📊 Dashboard
- Summary of registered women, pregnant women, high-risk assessments, and unresolved alerts
- Recent assessments at a glance
- Women breakdown by village

### 👩 Register Woman
- Register a woman with name, age, village, contact, pregnancy status, last menstrual period, and number of children

### 🩺 Log Symptoms
- Select from 30+ symptoms across categories: general health, menstrual, pregnancy, postpartum, and nutrition
- Receive instant awareness messages and referral guidance
- Risk level (Low / Moderate / High) is determined automatically
- Alerts are automatically created for high-risk and referral cases

### 📋 Assessment History
- Browse all assessments with filter by woman or risk level
- Expand each card to read awareness messages and referral reasons

### 📈 Awareness Report
- Pie chart of risk breakdown
- Monthly assessment trends bar chart
- Village-wise registration bar chart
- Referral rate summary

### 🔔 Alerts
- View all high-risk and referral alerts
- Filter by unresolved / resolved
- Mark alerts as resolved with one click

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/dashboard` | Dashboard summary |
| GET | `/women` | List all women (filterable) |
| POST | `/women` | Register a new woman |
| GET | `/women/{id}` | Get a single woman |
| PUT | `/women/{id}` | Update woman details |
| GET | `/symptoms/catalogue` | Full symptom list |
| POST | `/symptoms` | Log symptoms & get assessment |
| GET | `/history` | All assessments (filterable) |
| GET | `/history/{id}` | Single assessment |
| GET | `/report` | Awareness report summary |
| GET | `/alerts` | List alerts |
| PATCH | `/alerts/{id}/resolve` | Mark alert as resolved |

Interactive API docs: **http://localhost:8000/docs**

---

## Notes for ASHA Workers

- The app works **fully offline** once running on a local machine.
- All data is stored in the local `saheli.db` file.
- Back up `saheli.db` regularly to preserve records.
- This tool provides **awareness and referral support only** — always escalate high-risk cases to trained medical personnel.

---

## License

Free to use and adapt for community health purposes.
